using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeTrackingUpdateServer.Models
{
    public class TaskCategory
    {
        public string name { get; }
        public IList<Task> tasks { get; }
        public TaskCategory(string name, IEnumerable<Task> tasks = null)
        {
            this.name = name;
            this.tasks = new List<Task>(tasks ?? new List<Task>());
        }
    }
}
