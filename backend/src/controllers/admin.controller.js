const prisma = require('../utils/prisma');

const getAllUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: { projects: true, tasksAssigned: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit),
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getGlobalStats = async (req, res, next) => {
  try {
    const [userCount, projectCount, taskCount, overdueTasks] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { not: 'DONE' },
        },
      }),
    ]);

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    res.json({
      users: userCount,
      projects: projectCount,
      tasks: taskCount,
      overdue: overdueTasks,
      tasksByStatus: tasksByStatus.reduce((acc, t) => {
        acc[t.status] = t._count.status;
        return acc;
      }, {}),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, updateUserRole, getGlobalStats };
