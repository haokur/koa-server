import { App } from 'vue';
import { fmtDate } from '../utils/common.util';

export interface IErrorItemContent {
    href: string;
    info: string;
    message: string;
    stacks: string[];
    target_element: string;
    time: string;
    timestamp: number;
    type: string;
    user_agent: string;
}
export interface IErrorItem {
    source: string;
    content: IErrorItemContent;
    id: number;
}

export function handleErrorReport(app: App<Element>) {
    if ($env.NODE_ENV !== 'production') return;
    // window.onerror = function (message, source, lineno, colno, error) {
    // const [message, source, lineno, colno, error] = args;
    // reportError({
    //     message,
    //     lineno,
    //     colno,
    // });
    // };

    // 可处理加载资源的上报
    window.addEventListener(
        'error',
        (event: any) => {
            const sourceUrl = event?.target?.currentSrc;
            const config = {
                type: 'source_load_error',
                source_url: sourceUrl,
                message: `[GET:404] ${sourceUrl}`,
                target_element: event?.target?.outerHTML,
                stacks: event.path
                    .filter((item) => !!item.localName)
                    .map((item) => {
                        let stackStr = `${item.localName}`;
                        if (item.id) stackStr += `#${item.id}`;
                        if (item.className) stackStr += `.${item.className}`;
                        return stackStr;
                    }),
            };
            reportError(config);
        },
        true
    );

    // window.addEventListener('unhandledrejection', function (event) {
    //     console.log(event, 'error.service.ts::30行');
    //     // 错误处理
    //     // console.error('Custom Unhandled promise rejection:', event.reason);
    // });

    /**
     * vue全局错误处理
     * 当它存在时，则上面手动 window.onerror 和 unhandledrejection 失效，
     * 大概是 window.onerror 只能对应一个函数，内部覆盖了
     * 但是资源加载错误，还是会触发 window.addEventListener 的监听
     */
    app.config.errorHandler = function (err: any, vm: any, info) {
        // console.log(err, vm, info, 'error.service.ts::42行');
        const config = {
            type: 'vue_error',
            message: typeof err === 'string' ? err : err?.message,
            target_element: vm?.$el?.outerHTML,
            info,
        };
        if (err?.stack) {
            const stacks = err.stack.split('\n').map((item: string) => item.trim());
            Object.assign(config, { stacks });
        }
        reportError(config);
    };
}

/**埋点上报 */
export function reportError(content, source = 'client-h5') {
    const timestamp = Date.now();
    const config = {
        ...content,
        href: location.href,
        user_agent: navigator.userAgent,
        timestamp: timestamp,
        time: fmtDate(timestamp),
    };
    // console.log(config, 'error.service.ts::78行');
    const encodeConfig = encodeURIComponent(JSON.stringify(config));
    const img = new Image();
    img.src = `${$env.baseUrl}/log/report.png?content=${encodeConfig}&source=${source}`;
}
