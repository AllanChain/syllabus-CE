import React, {Component, PureComponent} from 'react';
import ReactDOM from 'react-dom';

import TimeAgo from 'react-timeago';
import chineseStrings from 'react-timeago/lib/language-strings/zh-CN';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

import './global.css';
import './widgets.css';

import appicon_hole from './appicon/hole.png';
import appicon_imasugu from './appicon/imasugu.png';
import appicon_imasugu_rev from './appicon/imasugu_rev.png';
import appicon_syllabus from './appicon/syllabus.png';
import appicon_score from './appicon/score.png';
import appicon_course_survey from './appicon/course_survey.png';
import {PKUHELPER_ROOT} from './const';
import {get_json, API_VERSION_PARAM} from './functions';

const LOGIN_BASE=PKUHELPER_ROOT+'services/login';
const LOGIN_POPUP_ANCHOR_ID='pkuhelper_login_popup_anchor';

function pad2(x) {
    return x<10 ? '0'+x : ''+x;
}
export function format_time(time) {
    return `${time.getMonth()+1}-${pad2(time.getDate())} ${time.getHours()}:${pad2(time.getMinutes())}:${pad2(time.getSeconds())}`;
}
const chinese_format=buildFormatter(chineseStrings);
export function Time(props) {
    const time=new Date(props.stamp*1000);
    return (
        <span>
            <TimeAgo date={time} formatter={chinese_format} />
            &nbsp;
            {format_time(time)}
        </span>
    );
}

export function TitleLine(props) {
    return (
        <p className="centered-line title-line aux-margin">
            <span className="black-outline">{props.text}</span>
        </p>
    )
}

export function GlobalTitle(props) {
    return (
        <div className="aux-margin">
            <div className="title">
                <p className="centered-line">{props.text}</p>
            </div>
        </div>
    );
}

const FALLBACK_APPS=[
    // id, text, url, icon_normal, icon_hover, new_tab
    ['hole','树洞','/hole',appicon_hole,null,false],
    ['imasugu','教室','/spare_classroom',appicon_imasugu,appicon_imasugu_rev,false],
    ['syllabus','课表','/syllabus',appicon_syllabus,null,false],
    ['score','成绩','/my_score',appicon_score,null,false],
    ['course_survey','测评','http://courses.pinzhixiaoyuan.com/',appicon_course_survey,appicon_course_survey,true],
];
const SWITCHER_DATA_VER='switcher_1';
const SWITCHER_DATA_URL=PKUHELPER_ROOT+'web_static/appswitcher_items.json';

export class AppSwitcher extends Component {
    constructor(props) {
        super(props);
        this.state={
            apps: this.get_apps_from_localstorage(),
        }
    }

    get_apps_from_localstorage() {
        let ret=FALLBACK_APPS;
        if(localStorage['APPSWITCHER_ITEMS'])
            try {
                let content=JSON.parse(localStorage['APPSWITCHER_ITEMS'])[SWITCHER_DATA_VER];
                if(!content || !content.length)
                    throw new Error('content is empty');

                ret=content;
            } catch(e) {
                console.error('load appswitcher items from localstorage failed');
                console.trace(e);
            }

        return ret;
    }

    componentDidMount() {
        setTimeout(()=>{
            fetch(SWITCHER_DATA_URL)
                .then((res)=>{
                    if(!res.ok) throw Error(`网络错误 ${res.status} ${res.statusText}`);
                    return res.text();
                })
                .then((txt)=>{
                    if(txt!==localStorage['APPSWITCHER_ITEMS']) {
                        console.log('loaded new appswitcher items',txt);
                        localStorage['APPSWITCHER_ITEMS']=txt;

                        this.setState({
                            apps: this.get_apps_from_localstorage(),
                        });
                    } else {
                        console.log('appswitcher items unchanged');
                    }
                })
                .catch((e)=>{
                    console.error('loading appswitcher items failed');
                    console.trace(e);
                });
        },500);
    }

    render() {
        let cur_id=this.props.appid;
        return (
            <div className="app-switcher">
                <span className="app-switcher-desc app-switcher-left">
                    <a href="/">PKUHelper</a>
                </span>
                {this.state.apps.map(([id,title,url,icon_normal,icon_hover,new_tab])=>(
                    <a key={id} className={'app-switcher-item'+(id===cur_id ? ' app-switcher-item-current' : '')} href={url} target={new_tab ? '_blank' : '_self'}>
                        {!!icon_normal && [
                            <img key="normal" src={icon_normal} className="app-switcher-logo-normal" />,
                            <img key="hover" src={icon_hover||icon_normal} className="app-switcher-logo-hover" />
                        ]}
                        <span>{title}</span>
                    </a>
                ))}
                <span className="app-switcher-desc  app-switcher-right">
                    网页版
                </span>
            </div>
        );
    }
}

class LoginPopupSelf extends Component {
    constructor(props) {
        super(props);
        this.state={
            loading_status: 'idle',
        };
        this.username_ref=React.createRef();
        this.password_ref=React.createRef();
        this.input_token_ref=React.createRef();

        this.popup_anchor=document.getElementById(LOGIN_POPUP_ANCHOR_ID);
        if(!this.popup_anchor) {
            this.popup_anchor=document.createElement('div');
            this.popup_anchor.id=LOGIN_POPUP_ANCHOR_ID;
            document.body.appendChild(this.popup_anchor);
        }
    }

    do_sendcode(api_name) {
        if(this.state.loading_status==='loading')
            return;

        this.setState({
            loading_status: 'loading',
        },()=>{
            fetch(
                PKUHELPER_ROOT+'api_xmcp/isop/'+api_name
                +'?user='+encodeURIComponent(this.username_ref.current.value)
                +API_VERSION_PARAM()
            )
                .then(get_json)
                .then((json)=>{
                    console.log(json);
                    if(!json.success)
                        throw new Error(JSON.stringify(json));

                    alert(json.msg);
                    this.setState({
                        loading_status: 'done',
                    });
                })
                .catch((e)=>{
                    console.error(e);
                    alert('发送失败\n'+e);
                    this.setState({
                        loading_status: 'done',
                    });
                });

        });
    }

    do_login(set_token) {
        if(this.state.loading_status==='loading')
            return;

        this.setState({
            loading_status: 'loading',
        },()=>{
            let data=new URLSearchParams();
            data.append('username', this.username_ref.current.value);
            data.append('valid_code', this.password_ref.current.value);
            data.append('isnewloginflow', 'true');
            fetch(LOGIN_BASE+'/login.php?platform=webhole'+API_VERSION_PARAM(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: data,
            })
                .then(get_json)
                .then((json)=>{
                    if(json.code!==0) {
                        if(json.msg) throw new Error(json.msg);
                        throw new Error(JSON.stringify(json));
                    }

                    set_token(json.user_token);
                    alert(`成功以 ${json.name} 的身份登录`);
                    this.setState({
                        loading_status: 'done',
                        popup_show: false,
                    });
                })
                .catch((e)=>{
                    console.error(e);
                    alert('登录失败\n'+e);
                    this.setState({
                        loading_status: 'done',
                    });
                });
        });
    }

    do_input_token(set_token) {
        if(this.state.loading_status==='loading')
            return;

        let token=this.input_token_ref.current.value;
        this.setState({
            loading_status: 'loading',
        },()=>{
            fetch(PKUHELPER_ROOT+'api_xmcp/hole/system_msg?user_token='+encodeURIComponent(token)+API_VERSION_PARAM())
                .then((res)=>res.json())
                .then((json)=>{
                    if(json.error)
                        throw new Error(json.error);
                    if(json.result.length===0)
                        throw new Error('result check failed');
                    this.setState({
                        loading_status: 'done',
                        popup_show: false,
                    });
                    set_token(token);
                })
                .catch((e)=>{
                    alert('Token检验失败\n'+e);
                    this.setState({
                        loading_status: 'done',
                    });
                    console.error(e);
                });
        });
    }

    render() {
        return ReactDOM.createPortal(
            <div>
                <div className="pkuhelper-login-popup-shadow" />
                <div className="pkuhelper-login-popup">
                    <p>
                        接收验证码来登录 PKU Helper
                    </p>
                    <p>
                        <label>
                            　学号&nbsp;
                            <input ref={this.username_ref} type="tel" autoFocus={true} />
                        </label>
                        <span className="pkuhelper-login-type">
                                <a onClick={(e)=>this.do_sendcode('validcode')}>
                                    &nbsp;短信&nbsp;
                                </a>
                                /
                                <a onClick={(e)=>this.do_sendcode('validcode2mail')}>
                                    &nbsp;邮件&nbsp;
                                </a>
                            </span>
                    </p>
                    <p>
                        <label>
                            验证码&nbsp;
                            <input ref={this.password_ref} type="tel" />
                        </label>
                        <button type="button" disabled={this.state.loading_status==='loading'}
                                onClick={(e)=>this.do_login(this.props.token_callback)}>
                            登录
                        </button>
                    </p>
                    <hr />
                    <p>从其他设备导入登录状态</p>
                    <p>
                        <input ref={this.input_token_ref} placeholder="User Token" />
                        <button type="button" disabled={this.state.loading_status==='loading'}
                                onClick={(e)=>this.do_input_token(this.props.token_callback)}>
                            导入
                        </button>
                    </p>
                    <hr />
                    <p>
                        <button onClick={this.props.on_close}>
                            取消
                        </button>
                    </p>
                </div>
            </div>,
            this.popup_anchor,
        );
    }
}

export class LoginPopup extends Component {
    constructor(props) {
        super(props);
        this.state={
            popup_show: false,
        };
        this.on_popup_bound=this.on_popup.bind(this);
        this.on_close_bound=this.on_close.bind(this);
    }

    on_popup() {
        this.setState({
            popup_show: true,
        });
    }
    on_close() {
        this.setState({
            popup_show: false,
        });
    }

    render() {
        let ch=this.props.children(this.on_popup_bound);
        return this.state.popup_show ?
            [ch, <LoginPopupSelf token_callback={this.props.token_callback} on_close={this.on_close_bound} />] :
            [ch];
    }
}