import React, {Component, PureComponent} from 'react';
import {PageHeader, Button, Affix, Icon} from 'antd';
import {ROUTES} from '../routes';

import './About.css';

import figure from './figure.png';

export function About(props) {
    return (
        <div>
            <Affix offsetTop={0}>
                <PageHeader
                    title="关于 课表助手"
                    onBack={()=>{props.navigate(ROUTES.homepage)}}
                />
            </Affix>
            <div className="main-margin about-frame">
                <p>本工具可以从选课系统或 ISOP 加载学期课表，进行编辑后生成通用的 iCalendar (.ICS) 日历文件，以方便查看。</p>
                <img src={figure} className="figure-img" />
                <p>由于不同软件对 iCalendar 日历的支持情况不同，生成的日历可能与校历有所偏差，请仔细核对后使用。</p>
                <p>由于使用本工具造成的后果，PKU Helper 当然不背锅。使用本工具将视为您了解并同意、甚至能熟练背诵出：</p>
                <p>
                    This program is distributed in the hope that it will be useful,
                    but WITHOUT ANY WARRANTY; without even the implied warranty of
                    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                    GNU General Public License for more details.
                </p>
            </div>
        </div>
    )
}