import { FileRoutes } from '../controllers/file.controller';
import { UserRoutes } from '../controllers/user.controller';

const route: IKeyValueObject = {
    ...UserRoutes,
    ...FileRoutes,
};

export default route;
