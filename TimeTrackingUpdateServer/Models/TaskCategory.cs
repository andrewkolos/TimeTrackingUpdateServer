using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TimeTrackingUpdateServer.Models
{
    public class TaskCategory
    {
        public string Name { get; }
        public IList<Task> Tasks { get; }
        public TaskCategory(string name, IEnumerable<Task> tasks = null)
        {
            Name = name;
            Tasks = new List<Task>(tasks ?? new List<Task>());
        }
    }
}
