import { useNotifications } from '../../globalProvider/GlobalProvider';
import './NotificationCentre.scss'

const NotificationCentre = () => {

    const { notifications } = useNotifications();

    return <div className="notificationCentre">

    </div>
}

export default NotificationCentre;