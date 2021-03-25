## Components and scope
Our application consists of a few things:
1. A web server. Our server offers two things:
	* A tiny web app to update the spreadsheet with.
	* An API endpoint that the web app sends stuff to, which will then be immediately used to update the spreadsheet.
2. The tiny web app. This is just a simple form that lets you pick a category and then an active task/project that belongs to that category.
	This can be a small form with a couple of drop downs and some space for notes or whatever. Mockup not included because I'm too lazy.

Note that we could theoretically run both of these on seperate servers (which would be a smart thing to do if each component was big or we
are dealing with massive scales of traffic). However, one server is perfect for our tiny little use case.

## Setup
Let's set upp our project.
https://docs.microsoft.com/en-us/aspnet/core/tutorials/razor-pages/razor-pages-start?view=aspnetcore-5.0&tabs=visual-studio
Lets get started by creating the project. In Visual Studio (VS), create an ASP.NET core web app through the new project interface. The standard web app template should start off us fine since we want
both a frontend (the tiny web app) and a tiny backend API. We don't need a robust frontend like Angular/React. Use the link above for a step-by-step. 
It also explains what the files created by the template are and what they are responsible for. Good stuff.

With your project setup, you can run the server locally on your machine to test/debug it. Press F5 in VS to start this. A browser window should open with the default app in it.

Now we can get started. First, I want to clarify how the back-end and front-end will communicate. Our server will have two routes:
	1. '/' (i.e. the "home route"). Let's stick the web-form here.
	2. '/update'. 
		* Request (from web browser to server);
			This route will take a JSON object. The schema of the object will be: 
			```JSON 
			{
				category: string;
				task: string;
				notes: string;
			}```
		* Response (server back to browser):
			* In the happy case (no error):
				```JSON
				{
					outcome: 'success',
				}
			* If something goes wrong (error):
				```JSON
				{
					outcome: 'error',
					errorMessage: string,
				}

With this contract set up, we can begin work pretty much anywhere. I'll start with the backend, but I'm going to leave the Excel stuff for later.

## Initial Frontend (creating the client-side form)

### Creating the structure of the form
We already have our server serving a demo/hello-world web page on the `/` route. We will update the web page to include the form described above.
The included css (in wwwroot/css) doesn't do much. Some libraries come pre-installed (wwwroot/lib), which include Bootstrap 
(a frontend styling framework to make our webpage resposive and pretty) and JQuery (which does a lot of things, and was more handy when the
Web API (JavaScript API provided by browsers) was a lot weaker). The Bootstrap css/js and jQuery JS code are added to our web pages
by the `script` tags in `_Layout.cshtml`. This file describes the layout of all of our web pages. If you look at the `class` attributes on many of the tags in that file,
you will notice things like `container` and `navbar navbar-expand-sm navbar-toggleable-sm ...`. These are CSS classes described by Bootstrap. Bootstrap is by
no means a requirement, but it makes our web page responsive to different screen sizes and has a decent default-looking web app style. I won't go into detail about
it since its a distraction, so accept it as magic for now.

Let's delete the Privacy page, which is described by `Privacy.cshtml`. We'll also delete the link to that page which is found in the `footer` of `_Layout.cshtml`,
`- <a asp-area="" asp-page="/Privacy">Privacy</a>`.

The `Index.cshtml` file describes the main content of our landing/home page. This is where we will add the form. Here is the html of `Index.cshtml` (I left the Razor
stuff at the top the same):

```html
<div class="container">
    <div class="row justify-content-center">
        <div class="col-6">
            <form>
                <div id="form">
                    <div class="form-group row">
                        <label for="category">Category</label>
                        <select id="category" class="form-control">
                            <option value="none selected" selected>Select...</option>
                            <option value="placeholder1">Placeholder 1</option>
                            <option value="placeholder2">Placeholder 2</option>
                            <option value="placeholder3">Placeholder 3</option>
                        </select>
                    </div>

                    <div class="form-group row">
                        <label for="task">Task:</label>
                        <select id="task" class="form-control">
                            <option value="none selected" selected>Select...</option>
                            <option value="placeholder1">Placeholder 1</option>
                            <option value="placeholder2">Placeholder 2</option>
                        </select>
                    </div>

                    <div class="form-group row">
                        <label for="notes">Notes:</label>
                        <textarea id="notes" class="form-control"></textarea>
                    </div>

                    <div class="form-group row justify-content-end">
                        <button type="submit" class="btn btn-primary">Update Spreadsheet</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
```

With this, you should see a basic but nice-looking form. Note that we have to use placeholder `option`s for now,
since we don't load the stuff from the spreadsheet yet via contacting the server.

## Making the `category` and `task` fields use information retrieved from the server (which retrieves from the excel file)


We have a few options here. We could expose an API endpoint on the server, `GET /api/Categories`. The browser would retrieve the HTML
that has the structure of the form and then, once it loads, it calls out the server to get the category information. This is a lot cleaner, but it results in 
two round trips, slowing down our load time.

Instead, we can include all the category information in the webpage itself. However, we are getting ahead of ourselves, first we need a way to model the data
on the server before we can send it to the client.

### Modeling the payloads on the server end

Let's create some model C# classes that represent the payloads the browser and server will use to communicate. These classes are just POCO classes
(POJO in the world of Java or POD/PODOS in a language-neutral context). POCO objects just hold simple data and aren't cabable of any behavior.

In the top of the project, create a `models` folder. This is where we will put the model classes.

First, add a `Task` class (`Models/Task.cs'):

```cs
    public class Task
    {
        public string name { get; }

        public Task(string name)
        {
            this.name = name;
        }
    }
```

Then, we'll add a `TaskCategory` class (`Models/TaskCategory.cs`):

```cs
    public class TaskCategory
    {
        public string name { get; }
        public IList<Task> Tasks { get; }
        public TaskCategory(string name, IEnumerable<Task> tasks = null)
        {
            this.name = name;
            Tasks = new List<Task>(tasks ?? new List<Task>());
        }
    }
```

One could argue we don't really need a class for `Task`, since it just consists of a single string, but this format allows us to easily add more info to
`Task` in the future. Either approach is fine.

### Retrieving cateogry information from the spreadsheet

Before we can include the categories on the web page, we need a way to read from the Excel file first. We'll use the `Microsoft.Office.Interop.Excel` library.
Before we can use this library, we need to include a reference to it in our project.
Right click `Dependencies` in the Solution Explorer (right-side by default). Under `COM`, search for `Microsoft Excel 16.0 Object Library`.

Now we need to add the code using this library. I will add a new class, `TimeTrackingWorkbookService.cs` at the top level of the project. This class will provide
static methods for interacting with the workbook. Our first method will be `GetCategories`:

```cs
    public class TimeTrackingWorkbookService
    {
        private static string WORKBOOK_PATH = $"{Environment.CurrentDirectory}/Working_Draft_Testing_Macros.xlsm";
        private static int PROJECTS_SHEET_INDEX = 6;
        private static char CATEGORIES_RANGE_START_COL = 'I';
        private static int CATEGORIES_RANGE_START_ROW = 22;

        public static IEnumerable<TaskCategory> GetCategories()
        {
            var app = new Excel.Application();
            var workbook = app.Workbooks.Open(WORKBOOK_PATH);
            var categoriesSheet = (Excel.Worksheet)workbook.Worksheets.get_Item("Projects");

            var currentRow = CATEGORIES_RANGE_START_ROW;
            var columnIndex = CATEGORIES_RANGE_START_COL - 'A' + 1;
            var categoryMap = new Dictionary<string, TaskCategory>();
            while (true) {

                var cell = (Excel.Range) categoriesSheet.Cells[currentRow, columnIndex];
                var categoryName = (string) cell.Value;

                if (string.IsNullOrEmpty(categoryName))
                {
                    break;
                }

                var task = ((Excel.Range)categoriesSheet.Cells[currentRow, columnIndex + 1]).Value.ToString();

                var category = categoryMap.ContainsKey(categoryName) ? categoryMap[categoryName] : new TaskCategory(categoryName);
                category.Tasks.Add(new Models.Task(task));
                categoryMap[categoryName] = category; // In case we got a defalt from GetValueOrDefault.

                currentRow += 1;
            }

            return categoryMap.Values;
        }
    }
```

### Including this information in the web page.
#### Getting the category information to the browser side
Notice that our `Index.cshtml` file is a `cshtml` file and not a normal `html` file. In a cshtml file, we write C# code that gets executed when we create
the page to send to the browser<sup>2</sup>. This C# code can return a string that will be interpolated into the markup. This means we can include the category
information this way. Before we can do this, we need a way to serialize our C# objects into a format that the browser can understand. The goto format for this
is JSON. So, we need a way to convert C# objects into JSON strings. The Newtonsoft.JSON library is extremely popular for this. To add this library to our project.
Right click Dependencies in the solution explorer (like we did for the Excel library) and select `Manage NuGet Packages`. Go to the Browse tab and search for the library
(it might appear already because of how popular it is). Select it and install it.

Now, open up `Index.cshtml`. At the top, under `@model IndexModel`, add this line `@using Newtonsoft.Json`. Then, below our form add this: 
`<span id="categoryInfo" class="d-none">@JsonConvert.SerializeObject(TimeTrackingWorkbookService.GetCategories())</span>`.
This is a hidden span (the user won't see it unless they dig into the page markup). The browser can then get our category information from here.
This seems a bit hacky to me, but it's the only way I'm aware of to get additional information from the server without having to make a second roundtrip.

However, if you try to run this now, you may get a vague error. The message escapes me now, but if you look it up it is a bug involving trying to reference
COM libraries from Core apps. To fix this, open up the `csproj` file (double click the name of the project).You will see a reference to the Excel library here.
Change it to this:

```
<ItemGroup>
		<COMReference Include="Microsoft.Office.Excel.dll">
			<WrapperTool>primary</WrapperTool>
			<VersionMinor>9</VersionMinor>
			<VersionMajor>1</VersionMajor>
			<Guid>00020813-0000-0000-c000-000000000046</Guid>
			<Lcid>0</Lcid>
			<Isolated>false</Isolated>
			<EmbedInteropTypes>True</EmbedInteropTypes>
		</COMReference>
</ItemGroup>
```

Here, we changed the `WrapperTool` value to `primary` and added the `EmbedInteropTypes` node. The webpage should load now. If you inspect the DOM, you should
see the category information.

#### Using this information to program the dropdowns

Next, we need get the dropdown behavior working. We need to add all the categories to the category field, and we need to update the options for the task
when the user selects a category. We are going to do this using JavaScript.


#### Adding TypeScript
We need to include the transpilation of TypeScript into JavaScript as part of our build process as the browser will not understand TypeScript.
Follow the instructions here: [https://www.typescriptlang.org/docs/handbook/asp-net-core.html](https://www.typescriptlang.org/docs/handbook/asp-net-core.html).

### How to communicate between JS (browser) and C# (server)
Notice how the client and server communicate over JSON (which is a common format). JSON is easy to convert to a native JS object that the browser
can work with, but we need some middleware<sup>1</sup> to convert JSON to a C#-friendly object format and vice-versa. While we could do this ourselves,
it's makes our server code more messy and harder-to-change (what if we change the schema of our JSON objects?). 
We can use the [JSON.NET](https://www.newtonsoft.com/json) library can to help us here.



<sup>[1]</sup>A middleware is usually just piece of code/software that helps two things communicate with eachother. In our case, it helps the web app
and the C# server-side code communicate since each language/runtime represents data in different ways. Another benefit is that we don't have to pollute
our server-side code with a bunch of inflexible logic to convert JSON to our C# classes and vice versa.
<sup>[2]</sup>This is the reason we have to annoyingly recompile the application to test changes made to HTML despite HTML not being a compiled language.
