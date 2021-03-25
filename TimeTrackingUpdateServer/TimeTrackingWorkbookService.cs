using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TimeTrackingUpdateServer.Models;
using Excel = Microsoft.Office.Interop.Excel;

namespace TimeTrackingUpdateServer
{
    public class TimeTrackingWorkbookService
    {
        private static string WORKBOOK_PATH = $"{Environment.CurrentDirectory}/Working_Draft_Testing_Macros.xlsm";
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
                category.tasks.Add(new Models.Task(task));
                categoryMap[categoryName] = category; // In case we got a defalt from GetValueOrDefault.

                currentRow += 1;
            }

            return categoryMap.Values;
        }
    }
}
