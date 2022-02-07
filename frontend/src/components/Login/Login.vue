<template>
  <div class="list row">

    <div class="col-md-8">
      <h4>Please enter log-in</h4>
      <div class="input-group mb-3">
        <form name="loginform" @submit.prevent="submitLogin">
          <input type="text" class="form-control" placeholder="username" autofocus
            v-model="username"/>
          <input type="password" class="form-control" placeholder="password"
            v-model="password" @keyup.enter="submitLogin"/>
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button"
              @click="submitLogin"
            >
              Login
            </button>
            <p>{{ message }}</p>
          </div>
        </form>
      </div>
    </div>
    
  </div>
</template>

<script>
import LoginService from "../../services/LoginService"
export default {
  name: "login-view",
  data() {
    return {
      username: "",
      password: "",
      message: ""
    };
  },
  methods: {
    submitLogin() {
      const data = {username: this.username, password: this.password}

      LoginService.login(data)
        .then(response => {
          console.log("login ui", response)
          console.log(this.$route)
          if(response.success) {
            window.location = "/"     
          }
          else {
            this.message = "Could not log in"
          }

        })
        .catch(e => {
          console.log(e);
        });
    }
    
  },
  mounted() {    

  }
};
</script>

<style scoped>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>