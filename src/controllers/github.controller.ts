async function GithubViewerCount(params, ctx) {
    console.log(params, ctx.req, 'github.controller.ts::2行');
    const svgContent = `
        <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" style="fill:pink"/>
            </rect>
            <desc>今日访问数：1234</desc>
        </svg>
    `;
    ctx.type = 'image/svg+xml; charset=utf-8'; // 设置响应类型为 SVG
    ctx.body = svgContent; // 设置响应体为 SVG 内容
}

export const GithubRoutes = {
    '/github/viewer-count': GithubViewerCount,
};
