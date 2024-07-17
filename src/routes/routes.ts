import { FileRoutes } from '../controllers/file.controller';
import { TestRoutes } from '../controllers/test.controller';
import { UserRoutes } from '../controllers/user.controller';

const route: IKeyValueObject = {
    ...UserRoutes,
    ...FileRoutes,
    ...TestRoutes,
};

export default route;
