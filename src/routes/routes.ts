import { FileRoutes } from '../controllers/file.controller';
import { GithubRoutes } from '../controllers/github.controller';
import { LogRoutes } from '../controllers/log.controller';
import { TestRoutes } from '../controllers/test.controller';
import { UserRoutes } from '../controllers/user.controller';
import { WebrtcWsRoutes } from '../controllers/webrtc-ws.controller';

const route: IKeyValueObject = {
    ...UserRoutes,
    ...FileRoutes,
    ...TestRoutes,
    ...GithubRoutes,
    ...WebrtcWsRoutes,
    ...LogRoutes,
};

export default route;
