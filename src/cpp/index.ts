// @ts-ignore
import cpp_addon from './build/Release/cpp_addon';
// @ts-ignore
import cpp_addon2 from './build/Release/cpp_addon2';

interface ICppAddon {
    method1(args: string): string;
    method2(): void;
}
const cppAddon: ICppAddon = cpp_addon;

interface ICppAddon2 {
    method3(): void;
    add(a: number, b: number): number;
}
const cppAddon2: ICppAddon2 = cpp_addon2;

export { cppAddon, cppAddon2 };
