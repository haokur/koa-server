// @ts-ignore
import rustModules from './native/index.node';

interface IRustModules {
    sayHello(): string;
}

const rModules: IRustModules = rustModules;

export { rModules };
