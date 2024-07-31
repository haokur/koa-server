use neon::prelude::*;

fn say_hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello world from rust"))
}

register_module!(mut cx, {
    cx.export_function("sayHello", say_hello)
});
