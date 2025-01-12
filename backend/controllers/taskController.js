module.exports = {
  getAllTasks: async (req, res, db) => {
    const user_id = req.user.userId; // Assuming req.user contains the authenticated user's information

    try {
      const tasks = await db('tasks').where({ user_id }).select('*'); // Fetch tasks for the logged-in user
      console.log('Fetched tasks:', tasks);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks", error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  },

  createTask: async (req, res, db) => {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    const { title, description, priority, status, subtasks, due_date } = req.body; // Ensure field names match
    const image = req.file ? req.file.path : null; // Handle the uploaded image
    const user_id = req.user.userId; // Extract user_id from the authenticated user's information

    console.log('Parsed fields:', { title, description, priority, status, subtasks, due_date, image });

    if (!title || !priority || !status || !due_date) {
      console.error('Missing required fields:', { title, priority, status, due_date });
      return res.status(400).json({ error: 'Missing required fields', fields: { title, priority, status, due_date } });
    }

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    try {
      const [newTask] = await db('tasks').insert({
        title,
        description,
        priority,
        status: status || 'Yet to do', // Default status
        subtasks: subtasks ? JSON.stringify(subtasks) : null,
        due_date: new Date(due_date).toISOString(), // Ensure due_date is stored in ISO format
        image,
        createdat: createdAt,
        updatedat: updatedAt,
        user_id, // Include the user_id
      }).returning('*'); // Return the newly created task

      console.log('New task created:', newTask);
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error adding task", error);
      res.status(500).json({ error: 'Failed to add task' });
    }
  },

  updateTask: async (req, res, db) => {
    console.log('Received request body:', req.body);

    const { id } = req.params;
    const { title, description, priority, status, subtasks, due_date } = req.body; // Ensure field names match
    const image = req.file ? req.file.path : null; // Handle the uploaded image
    const updatedAt = new Date().toISOString();

    if (!title || !priority || !status || !due_date) {
      console.error('Missing required fields:', { title, priority, status, due_date });
      return res.status(400).json({ error: 'Missing required fields', fields: { title, priority, status, due_date } });
    }

    try {
      const [updatedTask] = await db('tasks')
        .where({ id, user_id: req.user.userId }) // Ensure the task belongs to the logged-in user
        .update({
          title,
          description,
          priority,
          status,
          subtasks: subtasks ? JSON.stringify(subtasks) : null,
          due_date: new Date(due_date).toISOString(), // Ensure due_date is stored in ISO format
          image,
          updatedat: updatedAt,
        })
        .returning('*');

      console.log('Task updated:', updatedTask);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task", error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  },

  deleteTask: async (req, res, db) => {
    const { id } = req.params;

    try {
      await db('tasks').where({ id, user_id: req.user.userId }).del(); // Ensure the task belongs to the logged-in user
      console.log(`Task with ID ${id} deleted`);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task", error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  },

  markTaskAsComplete: async (req, res, db) => {
    const { id } = req.params;
    const updatedAt = new Date().toISOString();

    try {
      const [updatedTask] = await db('tasks')
        .where({ id, user_id: req.user.userId }) // Ensure the task belongs to the logged-in user
        .update({
          status: 'completed',
          updatedat: updatedAt,
        })
        .returning('*');

      console.log('Task marked as complete:', updatedTask);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error marking task as complete", error);
      res.status(500).json({ error: 'Failed to mark task as complete' });
    } 
  },

  getTaskProgress: async (req, res, db) => {
    console.log("getTaskProgress called");
    try {
      const progressData = await db('tasks')
        .select(db.raw('COUNT(*) as totalTasks, SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) as totalCompletedTasks'))
        .first();
      const progress = progressData.totaltasks > 0 ? (progressData.totalcompletedtasks / progressData.totaltasks) * 100 : 0;
      console.log("Progress data:", { ...progressData, progress });
      res.json({ ...progressData, progress });
    } catch (error) {
      console.error('Error fetching task progress:', error);
      res.status(500).json({ error: 'Failed to fetch task progress' });
    }
  },
};module.exports = {
  getAllTasks: async (req, res, db) => {
    const user_id = req.user.userId; // Assuming req.user contains the authenticated user's information

    try {
      const tasks = await db('tasks').where({ user_id }).select('*'); // Fetch tasks for the logged-in user
      console.log('Fetched tasks:', tasks);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks", error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  },

  createTask: async (req, res, db) => {
    console.log('Received request body:', req.body);
    console.log('Received file:', req.file);

    const { title, description, priority, status, subtasks, due_date } = req.body; // Ensure field names match
    const image = req.file ? req.file.path : null; // Handle the uploaded image
    const user_id = req.user.userId; // Extract user_id from the authenticated user's information

    console.log('Parsed fields:', { title, description, priority, status, subtasks, due_date, image });

    if (!title || !priority || !status || !due_date) {
      console.error('Missing required fields:', { title, priority, status, due_date });
      return res.status(400).json({ error: 'Missing required fields', fields: { title, priority, status, due_date } });
    }

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    try {
      const [newTask] = await db('tasks').insert({
        title,
        description,
        priority,
        status: status || 'Yet to do', // Default status
        subtasks: subtasks ? JSON.stringify(subtasks) : null,
        due_date: new Date(due_date).toISOString(), // Ensure due_date is stored in ISO format
        image,
        createdat: createdAt,
        updatedat: updatedAt,
        user_id, // Include the user_id
      }).returning('*'); // Return the newly created task

      console.log('New task created:', newTask);
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Error adding task", error);
      res.status(500).json({ error: 'Failed to add task' });
    }
  },

  updateTask: async (req, res, db) => {
    console.log('Received request body:', req.body);

    const { id } = req.params;
    const { title, description, priority, status, subtasks, due_date } = req.body; // Ensure field names match
    const image = req.file ? req.file.path : null; // Handle the uploaded image
    const updatedAt = new Date().toISOString();

    if (!title || !priority || !status || !due_date) {
      console.error('Missing required fields:', { title, priority, status, due_date });
      return res.status(400).json({ error: 'Missing required fields', fields: { title, priority, status, due_date } });
    }

    try {
      const [updatedTask] = await db('tasks')
        .where({ id, user_id: req.user.userId }) // Ensure the task belongs to the logged-in user
        .update({
          title,
          description,
          priority,
          status,
          subtasks: subtasks ? JSON.stringify(subtasks) : null,
          due_date: new Date(due_date).toISOString(), // Ensure due_date is stored in ISO format
          image,
          updatedat: updatedAt,
        })
        .returning('*');

      console.log('Task updated:', updatedTask);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task", error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  },

  deleteTask: async (req, res, db) => {
    const { id } = req.params;

    try {
      await db('tasks').where({ id, user_id: req.user.userId }).del(); // Ensure the task belongs to the logged-in user
      console.log(`Task with ID ${id} deleted`);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task", error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  },

  markTaskAsComplete: async (req, res, db) => {
    const { id } = req.params;
    const updatedAt = new Date().toISOString();

    try {
      const [updatedTask] = await db('tasks')
        .where({ id, user_id: req.user.userId }) // Ensure the task belongs to the logged-in user
        .update({
          status: 'completed',
          updatedat: updatedAt,
        })
        .returning('*');

      console.log('Task marked as complete:', updatedTask);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error marking task as complete", error);
      res.status(500).json({ error: 'Failed to mark task as complete' });
    } 
  },

  getTaskProgress: async (req, res, db) => {
    console.log("getTaskProgress called");
    try {
      const progressData = await db('tasks')
        .select(db.raw('COUNT(*) as totalTasks, SUM(CASE WHEN status = \'completed\' THEN 1 ELSE 0 END) as totalCompletedTasks'))
        .first();
      const progress = progressData.totaltasks > 0 ? (progressData.totalcompletedtasks / progressData.totaltasks) * 100 : 0;
      console.log("Progress data:", { ...progressData, progress });
      res.json({ ...progressData, progress });
    } catch (error) {
      console.error('Error fetching task progress:', error);
      res.status(500).json({ error: 'Failed to fetch task progress' });
    }
  },
  addReflection: async (req, res, db) => {
    const { id } = req.params;
    const { reflection } = req.body;
    const updatedAt = new Date().toISOString();

    console.log(`Received request to add reflection for task ID: ${id}`);
    console.log(`Reflection: ${reflection}`);
    console.log(`User ID: ${req.user.userId}`);

    try {
      const task = await db('tasks').where({ id, user_id: req.user.userId }).first();
      if (!task) {
        console.error(`Task with ID ${id} not found for user ID ${req.user.userId}`);
        return res.status(404).json({ error: 'Task not found' });
      }

      console.log(`Task found: ${JSON.stringify(task)}`);

      const newReflectionHistory = task.reflection_history
        ? `${task.reflection_history}\n${updatedAt}: ${reflection}`
        : `${updatedAt}: ${reflection}`;

      console.log(`Updated reflection history: ${newReflectionHistory}`);

      const [updatedTask] = await db('tasks')
        .where({ id, user_id: req.user.userId })
        .update({
          reflection_history: newReflectionHistory,
          updatedat: updatedAt,
        })
        .returning('*');

      console.log(`Task updated successfully: ${JSON.stringify(updatedTask)}`);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error adding reflection", error);
      res.status(500).json({ error: 'Failed to add reflection' });
    }
  },
  getReflectionHistory: async (req, res, db) => {
    const user_id = req.user.userId;

    try {
      const reflections = await db('tasks')
        .where({ user_id, status: 'completed' })
        .select('id', 'title', 'description', 'reflection_history', 'updatedat');
      console.log('Fetched reflection history:', reflections);
      res.json(reflections);
    } catch (error) {
      console.error("Error fetching reflection history", error);
      res.status(500).json({ error: 'Failed to fetch reflection history' });
    }
  },
};