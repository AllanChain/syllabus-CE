export function get_json(res) {
    if(!res.ok) throw Error(`网络错误 ${res.status} ${res.statusText}`);
    return res.json();
}

export function listen_darkmode(override) { // override: true/false/undefined
    function update_color_scheme() {
        if(override===undefined ? window.matchMedia('(prefers-color-scheme: dark)').matches : override)
            document.body.classList.add('root-dark-mode');
        else
            document.body.classList.remove('root-dark-mode');
    }

    update_color_scheme();
    window.matchMedia('(prefers-color-scheme: dark)').addListener(()=>{
        update_color_scheme();
    });
}

export function API_VERSION_PARAM() {
    return '&PKUHelperAPI=3.0&jsapiver='+encodeURIComponent((process.env.REACT_APP_BUILD_INFO||'null')+'-'+(Math.floor(+new Date()/7200000)*2));
}