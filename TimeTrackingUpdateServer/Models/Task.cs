using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Office.Interop.Excel;

namespace TimeTrackingUpdateServer.Models
{
    public class Task
    {
        public string name { get; }

        public Task(string name)
        {
            this.name = name;
        }
    }
}
