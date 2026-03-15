import { useNotifications } from "../../globalProvider/GlobalProvider";
import { useEffect, useRef } from "react";
import "./NotificationCentre.scss";

const NotificationCentre = () => {
	const timersRef = useRef<Map<string, number>>(new Map());
	const { notifications, removeNotification } = useNotifications();

	useEffect(() => {
		notifications.forEach((notification) => {
			if (timersRef.current.has(notification.id)) {
				return;
			}

			const timeoutMs = notification.timeout ?? 5000;
			const timerId = window.setTimeout(() => {
				removeNotification(notification.id);
				timersRef.current.delete(notification.id);
			}, timeoutMs);

			timersRef.current.set(notification.id, timerId);
		});

		const activeNotificationIds = new Set(notifications.map((notification) => notification.id));
		timersRef.current.forEach((timerId, notificationId) => {
			if (!activeNotificationIds.has(notificationId)) {
				window.clearTimeout(timerId);
				timersRef.current.delete(notificationId);
			}
		});
	}, [notifications, removeNotification]);

	useEffect(() => {
		return () => {
			timersRef.current.forEach((timerId) => {
				window.clearTimeout(timerId);
			});
			timersRef.current.clear();
		};
	}, []);

	return (
		<div className="notificationCentre">
			{notifications.map((notification) => (
				<div key={notification.id} className={`notification notification--${notification.type.toLowerCase()}`}>
					<p className="notification__text">{notification.text}</p>
					<button
						type="button"
						className="notification__dismiss"
						onClick={() => removeNotification(notification.id)}
						aria-label={`Dismiss ${notification.type} notification`}
					>
						Dismiss
					</button>
				</div>
			))}
		</div>
	);
};

export default NotificationCentre;
