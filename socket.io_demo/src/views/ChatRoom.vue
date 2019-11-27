<template>
  <div>
    <a-layout id="components-layout-demo-fixed-sider">
      <a-layout-sider :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }">
        <a-menu theme="dark" mode="inline">
          <a-menu-item key="global" @click="switchToGobalChatRoom()">
            <a-icon type="global" />
            <span id="test" class="nav-text">公共聊天室</span>
          </a-menu-item>
          <a-menu-item
            v-for="value of this.userList"
            :key="'guess'+value.id"
            @click="swithToPrivateChatRoom(value)"
          >
            <a-icon type="user" />
            <span class="nav-text">{{`${value.nickName} ${value.id==socketID?'(your self)':''}`}}</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout :style="{ marginLeft: '200px' ,display:'flex',height:'100vh'}">
        <a-layout-header :style="{ background: '#fff', padding: 0 ,textAlign:'center'}">
          <h1 @click="switchToGobalChatRoom">聊天室v1.0.0</h1>
        </a-layout-header>
        <a-layout-content :style="{ margin: '24px 16px 0',flex:1 }">
          <div
            class="Container"
            :style="{ padding: '24px', background: '#fff',overflowY: 'auto',height:'94%',padding:0,overflowWrap:'break-word',wordBreak:'break-all'}"
          >
            <!-- 当信息类型是broadcast（广播）时，与其他类型设置的class是不同的，广播居中显示，其他接收来的靠左 -->
            <!-- 当信息是自己发出时，居右显示 -->
            <p
              :class="{message:value.type=='globalChat'||'myself'||'privateMyself',info:value.type=='broadcast'}"
              v-for="(value,index) of this.messageList"
              :key="index"
              :style="{textAlign:value.type=='myself'||value.type=='privateMyself'?'right':'none'}"
            >
              <!-- 当信息类型是globalChat（公共聊天）时，此时显示发送者的名称 -->
              <span
                :key="nickName+'type'"
                :style="{color:value.color,fontSize:'large', fontWeight:'bold' }"
                v-if="value.type=='globalChat'"
              >{{`${value.nickName} `}}</span>
              <!-- 当信息类型是privateChat（私密聊天）时，此时标注发送者只发送给你 -->
              <span
                :key="nickName+'type'"
                :style="{color:value.color,fontSize:'large', fontWeight:'bold' }"
                v-if="value.type=='privateChat'"
              >{{`${value.nickName} only to you `}}</span>
              <!-- 当信息类型是privateMyself（自己发出的私密聊天）时，此时标注好只有谁接收 -->
              <span
                :key="nickName+'type'"
                :style="{color:value.color,fontSize:'large', fontWeight:'bold' }"
                v-if="value.type=='privateMyself'"
              >{{` only to ${value.privateTarget.nickName} `}}</span>
              <!-- 具体信息内容 -->
              <span :key="nickName+'content'">{{`${value.content}`}}</span>
            </p>
            <p v-if="istyping" class="typing">{{`${whoistyping} is typing`}}</p>
          </div>
          <a-input
            placeholder="Type here..."
            allowClear
            :style="{height:'6%',border:'medium solid black' }"
            @keyup.enter="sendMessage"
            v-model="inputValue"
          />
        </a-layout-content>
        <a-layout-footer
          :style="{ textAlign: 'center',backgroundColor:'gray'}"
        >Socket.Io ChatRoom ©2019 Created by Cyj</a-layout-footer>
      </a-layout>
    </a-layout>
  </div>
</template>


<script>
import io from "socket.io-client";
// import _ from "lodash";
export default {
  name: "ChatRoom",
  data() {
    return {
      socket: null, //socket.io的客户端
      socketID: null, //当前用户的socket id
      userData: null, //当前用户的信息
      inputValue: "", //当前输入框中的数据
      messageList: [], //消息列表
      userList: [], //在线用户列表
      userColor: null, //代表当前用户的颜色,
      istyping: false, //是否有用户正在输入,
      whoistyping: "", //正在输入的用户名
      timeout: null, //计时器ID，计时结束时istyping会改为false
      mode: "global", //聊天模式，默认是全局聊天，可切换为私密聊天(privateMyself)
      privateTarget: null //私密聊天时的对象的socket id
    };
  },
  watch: {
    //监听输入框，当输入框发生变化时，触发事件告诉服务器本人正在输入
    inputValue() {
      //必须当inputValue的长度大于0时才触发，不然发出消息后清空消息框时又会触发一次
      if (this.inputValue.length > 0) this.socket.emit("typing", this.nickName);
    }
  },
  props: ["nickName"], //用户在登录页时输入的名称
  methods: {
    //发送消息至服务器,自己发送的消息直接添加到显示列表中，服务器不会把自己发出的消息发回
    sendMessage() {
      //整理数据格式
      let data = {
        nickName: this.nickName,
        content: this.inputValue,
        color: this.userColor
      };
      //触发服务器的监听
      if (this.mode == "global") {
        this.socket.emit("globalChat", data);
        //本地直接添加显示信息
        data.type = "myself";
      } else {
        data.privateTarget = this.privateTarget;
        this.socket.emit("privateChat", data);
        //本地直接添加显示信息
        data.type = "privateMyself";
      }
      this.messageList.push(data);
      this.inputValue = "";
    },
    //获取随机rgb格式颜色
    getRandomColor() {
      let r, g, b;
      r = Math.floor(Math.random() * 256);
      g = Math.floor(Math.random() * 256);
      b = Math.floor(Math.random() * 256);
      return `rgb(${r},${g},${b})`;
    },
    //切换到公共聊天室
    switchToGobalChatRoom() {
      this.mode = "global";
    },
    //切换到私密聊天模式
    swithToPrivateChatRoom(userData) {
      this.mode = "privateMyself";
      this.privateTarget = userData;
    }
  },
  updated() {
    //当显示的消息溢出时，屏幕自动滚动到底部已显示最新消息
    this.$nextTick(() => {
      this.$el.querySelector(".Container").scrollTop = this.$el.querySelector(
        ".Container"
      ).scrollHeight;
    });
  },
  mounted() {
    document.getElementById("test").click();

    //设置用户颜色
    this.userColor = this.getRandomColor();
    //如果页面加载时，发现没有nickName（如原地刷新），那么就退回登录界面
    if (!this.nickName) {
      this.$router.push({ name: "Login" });
    }
    //连接socketio服务器
    this.socket = io("http://localhost:3000");

    //监听socketID事件，当链接服务器成功时，会被触发，此时要存贮要身份信息
    this.socket.on("socketID", id => {
      //由于监听是异步的，所以基于这个监听的返回值的所有相关调用都要在此回调里执行
      this.socketID = id;
      //格式化个人信息后存储
      this.userData = {
        id: this.socketID,
        nickName: this.nickName
      };
      //触发登录事件，把个人身份信息穿给服务器存储
      this.socket.emit("signIn", this.userData);
    });

    //监听broadcast事件，当服务器发出公告时，需要显示出来
    this.socket.on("broadcast", (...msg) => {
      this.messageList.push({ type: "broadcast", content: msg[0] });
      this.userList = msg[1];
    });

    //监听公共聊天事件，当有用户发起对话时，所有在线用户都能接收
    this.socket.on("globalChat", msg => {
      //清除定时器，并取消正在输入状态
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.istyping = false;
      //展示接收到的对话消息
      this.messageList.push({
        type: "globalChat",
        content: msg.content,
        nickName: msg.nickName,
        color: msg.color
      });
      //监听浏览器，当关闭页面时，触发登出事件
      window.addEventListener("unload", () => {
        this.socket.emit("signOut", this.userData);
      });
    });

    //监听正在输入事件，当有用户正在输入时，除其本人之外所有在线用户都能收到
    this.socket.on("typing", nickName => {
      //记录正在输入的用户
      this.whoistyping = nickName;
      //显示用户正在输入的提示
      this.istyping = true;
      //设定定时器，两秒后会把输入状态清除
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.timeout = setTimeout(() => {
        this.istyping = false;
      }, 500);
    });

    //监听私密聊天事件
    this.socket.on("privateChat", msg => {
      this.messageList.push({
        type: "privateChat",
        content: msg.content,
        nickName: msg.nickName,
        color: msg.color,
        privateChat: msg.privateChat
      });
    });
  },
  beforeDestroy() {
    //离开页面时，触发登出事件
    this.socket.emit("signOut", this.userData);
  }
};
</script>

<style>
/* ::-webkit-scrollbar {
  display: none;
} */
.message {
  margin: 0;
  padding: 0.25em;
  font-size: 1.5em;
}

.info {
  text-align: center;
  font-size: large;
}
.typing {
  color: red;
}
</style>