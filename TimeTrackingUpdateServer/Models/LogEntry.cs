using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeTrackingUpdateServer.Models
{
    public class LogEntry
    {
        public string CategoryName { get; }
        public string TaskName { get; }
        public string Notes { get; }

        public LogEntry(string categoryName, string taskName, string notes)
        {
            CategoryName = categoryName;
            TaskName = taskName;
            Notes = notes;
        }
    }
}
