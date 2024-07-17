import { FileRoutes } from '../controllers/file.controller';
import { GithubRoutes } from '../controllers/github.controller';
import { TestRoutes } from '../controllers/test.controller';
import { UserRoutes } from '../controllers/user.controller';

const route: IKeyValueObject = {
    ...UserRoutes,
    ...FileRoutes,
    ...TestRoutes,
    ...GithubRoutes,
};

export default route;
