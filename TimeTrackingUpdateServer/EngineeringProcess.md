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
since we don't load the stuff from the spreadsheet yet.


Start out by deleting everyting in `wwwroot/lib`.
Open up the `_Layout.cshtml` file. This describes a common layout each page will have.


The css directory contains the css used to make the site appear pretty. We don't need our app to look pretty, so I won't use any css at the start.
I'll add some tiny bit of our own css once we are done with the project to make it look prettier.
The JS library conains JavaScript code that can be run on the browser.


## Initial Backend
### Modeling the payloads on the server end

Let's create some model C# classes that represent the payloads the browser and server will use to communicate. These classes are just POCO classes
(POJO in the world of Java or POD/PODOS in a language-neutral context). POCO objects just hold simple data and aren't cabable of any behavior.

In the top of the project, I created a `models` folder. These are where we will put the model classes.

### How to communicate between JS (browser) and C# (server)
Notice how the client and server communicate over JSON (which is a common format). JSON is easy to convert to a native JS object that the browser
can work with, but we need some middleware<sup>1</sup> to convert JSON to a C#-friendly object format and vice-versa. While we could do this ourselves,
it's makes our server code more messy and harder-to-change (what if we change the schema of our JSON objects?). 
We can use the [JSON.NET](https://www.newtonsoft.com/json) library can to help us here.



<sup>[1]A middleware is usually just piece of code/software that helps two things communicate with eachother. In our case, it helps the web app
and the C# server-side code communicate since each language/runtime represents data in different ways. Another benefit is that we don't have to pollute
our server-side code with a bunch of inflexible logic to convert JSON to our C# classes and vice versa.