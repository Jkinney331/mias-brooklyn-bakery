import { Router } from 'express';
import { authenticate, AuthRequest } from '@/middleware/auth';
import { asyncHandler } from '@/middleware/error';
import { ResponseUtil } from '@/utils/response';
import { dataStore } from '@/services/data-store';
import { LocationId } from '@/types';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @route GET /api/notifications
 * @desc Get notifications for user
 * @access Private
 */
router.get('/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { limit = 20, unread = false } = req.query;
    
    let notifications = req.user?.locationId 
      ? dataStore.getNotificationsByLocation(req.user.locationId as any)
      : dataStore.getNotifications();

    // Filter unread if requested
    if (unread === 'true') {
      notifications = notifications.filter(notification => !notification.read);
    }

    // Limit results
    notifications = notifications.slice(0, parseInt(limit as string));

    ResponseUtil.success(res, notifications);
  })
);

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.put('/:id/read',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    
    const notification = dataStore.markNotificationRead(id);
    if (!notification) {
      return ResponseUtil.notFound(res, 'Notification not found');
    }

    logger.info('Notification marked as read', { 
      notificationId: id, 
      userId: req.user?.id 
    });

    ResponseUtil.success(res, notification, 'Notification marked as read');
  })
);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete notification
 * @access Private
 */
router.delete('/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    
    const deleted = dataStore.deleteNotification(id);
    if (!deleted) {
      return ResponseUtil.notFound(res, 'Notification not found');
    }

    logger.info('Notification deleted', { 
      notificationId: id, 
      userId: req.user?.id 
    });

    ResponseUtil.success(res, null, 'Notification deleted');
  })
);

/**
 * @route POST /api/notifications/mark-all-read
 * @desc Mark all notifications as read for user
 * @access Private
 */
router.post('/mark-all-read',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const notifications = req.user?.locationId 
      ? dataStore.getNotificationsByLocation(req.user.locationId as any)
      : dataStore.getNotifications();

    let markedCount = 0;
    notifications.forEach(notification => {
      if (!notification.read) {
        dataStore.markNotificationRead(notification.id);
        markedCount++;
      }
    });

    logger.info('All notifications marked as read', { 
      count: markedCount, 
      userId: req.user?.id 
    });

    ResponseUtil.success(res, { markedCount }, `${markedCount} notifications marked as read`);
  })
);

export { router as notificationsRouter };