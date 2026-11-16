import ServiceRequestReportsPage from '../pages/ServiceRequestReportsPage'
import { useLocation, Navigate } from 'react-router'
import ServiceRequestsPage from '../pages/ServiceRequestsPage'
import ServiceRequestCreatePage from '../pages/ServiceRequestCreatePage'
import ServiceRequestDetailPage from '../pages/ServiceRequestDetailPage'
export default function RequestPages(){const {pathname}=useLocation();if(pathname==='/requests')return <ServiceRequestsPage/>;if(pathname==='/requests/reports')return <ServiceRequestReportsPage/>;if(pathname==='/requests/products')return <Navigate to="/requests" replace/>;if(pathname==='/requests/new')return <ServiceRequestCreatePage/>;if(pathname==='/requests/types')return <Navigate to="/settings/request-types" replace/>;const detail=pathname.match(/^\/requests\/(srq_[A-Za-z0-9_]+)$/);return detail?<ServiceRequestDetailPage id={detail[1]}/>:<Navigate to="/requests" replace/>}
