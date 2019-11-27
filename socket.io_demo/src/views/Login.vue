<template>
  <div class="home">
    <div class="container">
      <h1>What's your nickname?</h1>
      <input autofocus v-model="nickName" @keyup.enter="login" />
    </div>
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    return {
      nickName: ""
    };
  },
  methods: {
    login() {
      this.$router.push({
        name: "ChatRoom",
        params: { nickName: this.nickName }
      });
    }
  },
  components: {}
};
</script>

<style lang="scss" scoped>
.home {
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  .container {
    h1 {
      color: #fff;
    }
    input {
      width: 100%;
      background-color: black;
      border: none;
      color: #fff;
      border-bottom: thin solid white;
      text-align: center;
      font-size: 2em;
    }
    input:focus {
      outline: none;
    }
  }
}
</style>