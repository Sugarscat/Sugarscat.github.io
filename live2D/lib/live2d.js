const live2d_load = function (prop) {
    const that = this;

    const current = {
        idol: 0,
        menu: document.querySelector(".live2d-container .live2d-action"),
        canvas: document.getElementById("live2d"),
        body: document.querySelector(".live2d-container"),
        root: document.location.protocol + '//' + document.location.hostname + '/'
    };

    /* - 方法 */
    const modules = {
        // 创建内容
        create: function (tag, prop) {
            const e = document.createElement(tag);
            if (prop.class) e.className = prop.class;
            return e;
        },
        // 随机内容
        rand: function (arr) {
            return arr[Math.floor(Math.random() * arr.length + 1) - 1];
        },
        // 创建对话框方法
        render: function (text) {
            if (text.constructor === Array) {
                dialog.innerHTML = modules.rand(text);
            } else if (text.constructor === String) {
                dialog.innerHTML = text;
            } else {
                dialog.innerHTML = "输入内容出现问题了 X_X";
            }

            dialog.classList.add("active");

            clearTimeout(this.t);
            this.t = setTimeout(function () {
                dialog.classList.remove("active");
            }, 3000);
        },
        // 移除方法
        destroy: function () {
            that.initHidden();
            localStorage.setItem("posterGirl", '0');
        },
    };
    this.modules = modules;
    this.destroy = modules.destroy;

    const elements = {
        close: modules.create("div", {class: "live2d-close cursor_link"}),

        show: modules.create("div", {class: "live2d-show cursor_none"})
    };

    const dialog = modules.create("div", {class: "live2d-dialog cursor_link"});
    current.body.appendChild(dialog);
    current.body.appendChild(elements.show);

    /* - 提示操作 */
    const action = {
        // 欢迎
        welcome: function () {
            if (document.referrer !== "" && document.referrer.indexOf(current.root) === -1) {
                const referrer = document.createElement('a');
                referrer.href = document.referrer;
                prop.content.referer ? modules.render(prop.content.referer.replace(/%t/, "“" + referrer.hostname + "”")) : modules.render("欢迎来自 “" + referrer.hostname + "” 的朋友！");
            } else if (prop.tips) {
                let text, hour = new Date().getHours();

                if (hour > 22 || hour <= 5) {
                    text = '你是夜猫子呀？这么晚还不睡觉，明天起的来嘛';
                } else if (hour > 5 && hour <= 8) {
                    text = '早上好！';
                } else if (hour > 8 && hour <= 11) {
                    text = '上午好！工作顺利嘛，不要久坐，多起来走动走动哦！';
                } else if (hour > 11 && hour <= 14) {
                    text = '中午了，工作了一个上午，现在是午餐时间！';
                } else if (hour > 14 && hour <= 17) {
                    text = '午后很容易犯困呢，今天的运动目标完成了吗？';
                } else if (hour > 17 && hour <= 19) {
                    text = '傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~';
                } else if (hour > 19 && hour <= 21) {
                    text = '晚上好，今天过得怎么样？';
                } else if (hour > 21 && hour <= 23) {
                    text = '已经这么晚了呀，早点休息吧，晚安~';
                } else {
                    text = "(ᗜ ˰ ᗜ)";
                }

                modules.render(text);
            } else {
                modules.render(prop.content.welcome || "欢迎！(ᗜ ˰ ᗜ)");
            }
        },
        // 触摸
        touch: function () {
            current.canvas.onclick = function () {
                modules.render(prop.content.touch || ["你在干什么？", "再摸我就报警了！", "HENTAI!", "不可以这样欺负我啦！"]);
            };
        },
        // 右侧按钮
        buttons: function () {
            // 仅保留关闭功能
            // 关闭看板娘
            elements.close.onclick = function () {
                modules.destroy();
            };
            elements.close.onmouseover = function () {
                modules.render(prop.content.close || "QWQ 下次再见吧~");
            };
            current.menu.appendChild(elements.close);
        },
        custom: function () {
            prop.content.custom.forEach(function (t) {
                if (!t.type) t.type = "default";
                const e = document.querySelectorAll(t.selector);

                if (e.length) {
                    for (let j = 0; j < e.length; j++) {
                        if (t.type === "read") {
                            e[j].onmouseover = function () {
                                modules.render("想阅读 %t 吗？".replace(/%t/, "“" + this.innerText + "”"));
                            }
                        } else if (t.type === "link") {
                            e[j].onmouseover = function () {
                                modules.render("想了解一下 %t 吗？".replace(/%t/, "“" + this.innerText + "”"));
                            }
                        } else if (t.text) {
                            e[j].onmouseover = function () {
                                modules.render(t.text);
                            }
                        }
                    }
                }
            });
        }
    };

    /* - 运行 */
    const begin = {
        static: function () {
            current.body.classList.add("static");
        },
        fixed: function () {
            action.touch();
            action.buttons();
        },
        draggable: function () {
            action.touch();
            action.buttons();

            const body = current.body;
            body.onmousedown = function (downEvent) {
                const location = {
                    x: downEvent.clientX - this.offsetLeft,
                    y: downEvent.clientY - this.offsetTop
                };

                function move(moveEvent) {
                    body.classList.add("active");
                    body.classList.remove("right");
                    body.style.left = (moveEvent.clientX - location.x) + 'px';
                    body.style.top = (moveEvent.clientY - location.y) + 'px';
                    body.style.bottom = "auto";
                }

                document.addEventListener("mousemove", move);
                document.addEventListener("mouseup", function () {
                    body.classList.remove("active");
                    document.removeEventListener("mousemove", move);
                });
            };
        }
    };

    // 运行
    this.init = function (onlyText) {
        if (!onlyText) {
            action.welcome();
            that.model = loadlive2d("live2d", prop.model[0], model => {
                prop.onModelLoad && prop.onModelLoad(model)
            });
        }

        switch (prop.mode) {
            case "static":
                begin.static();
                break;
            case "fixed":
                begin.fixed();
                break;
            case "draggable":
                begin.draggable();
                break;
        }

        if (prop.content.custom) action.custom();
    };

    // 隐藏状态
    this.initHidden = function () {
        current.body.classList.add("hidden");
        dialog.classList.remove("active");

        elements.show.onclick = function () {
            current.body.classList.remove("hidden");
            localStorage.setItem("posterGirl", '1');
            that.init();
        }
    }

    Number(localStorage.getItem("posterGirl")) === 0 ? this.initHidden() : this.init();
};

// 请保留版权说明
if (window.console && window.console.log) {
    console.log("%c Pio %c https://paugram.com", "color: #fff; margin: 1em 0; padding: 5px 0; background: #673ab7;", "margin: 1em 0; padding: 5px 0; background: #efefef;");
}
