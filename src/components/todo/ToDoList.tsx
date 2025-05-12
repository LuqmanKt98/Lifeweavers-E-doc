
// src/components/todo/ToDoList.tsx
"use client";

import { useState, FormEvent } from 'react';
import type { ToDoTask, User } from '@/lib/types';
import ToDoItem from './ToDoItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, ListChecks, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface ToDoListProps {
  clientId: string;
  tasks: ToDoTask[];
  currentUser: User;
  onAddTask: (description: string, dueDate?: string) => void;
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
  canModify: boolean; // General permission to interact (add, toggle)
  canDeleteSystemGenerated: boolean; // Specific permission for SuperAdmin to delete system tasks
}

export default function ToDoList({ 
    clientId, 
    tasks, 
    currentUser, 
    onAddTask, 
    onToggleTask, 
    onRemoveTask,
    canModify,
    canDeleteSystemGenerated
}: ToDoListProps) {
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(''); // Optional due date

  const handleSubmitNewTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskDescription.trim()) return;
    onAddTask(newTaskDescription.trim(), newTaskDueDate || undefined);
    setNewTaskDescription('');
    setNewTaskDueDate('');
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isDone !== b.isDone) {
      return a.isDone ? 1 : -1; // Incomplete tasks first
    }
    const aDueDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDueDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    if (aDueDate !== bDueDate) {
      return aDueDate - bDueDate; // Sort by due date (earliest first)
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Then by creation date (newest first within same due date/status)
  });

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-primary">
            <ListChecks className="h-6 w-6"/> Things To Do
        </CardTitle>
        <CardDescription>
            Manage tasks for this client. Track progress and upcoming deadlines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canModify && (
          <form onSubmit={handleSubmitNewTask} className="flex flex-col sm:flex-row items-stretch gap-3 mb-6 p-4 border rounded-lg bg-secondary/20">
            <div className="flex-grow space-y-2">
                <Input
                type="text"
                placeholder="New task description..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="bg-background"
                aria-label="New task description"
                />
                <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-background text-sm"
                aria-label="New task due date (optional)"
                />
            </div>
            <Button type="submit" disabled={!newTaskDescription.trim()} className="sm:self-end h-auto sm:h-auto py-2 px-4">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </form>
        )}

        {sortedTasks.length > 0 ? (
          <ScrollArea className="h-[300px] pr-3"> {/* Added pr-3 for scrollbar spacing */}
            <ul className="space-y-3">
              {sortedTasks.map(task => (
                <ToDoItem 
                  key={task.id} 
                  task={task} 
                  currentUser={currentUser} 
                  onToggleTask={onToggleTask}
                  onRemoveTask={onRemoveTask}
                  canModify={canModify}
                  canDeleteSystemGenerated={canDeleteSystemGenerated}
                />
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="mx-auto h-10 w-10 mb-2"/>
            <p>No tasks yet for this client.</p>
            {canModify && <p className="text-sm">Add a task using the form above.</p>}
          </div>
        )}
      </CardContent>
      { tasks.length > 0 && 
        <CardFooter className="text-xs text-muted-foreground border-t pt-3">
            {tasks.filter(t => !t.isDone).length} task(s) pending.
        </CardFooter>
      }
    </Card>
  );
}
