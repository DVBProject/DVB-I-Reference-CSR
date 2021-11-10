<template>
  <div class="list row">

    <div class="col-md-8">
      <h4>Please enter log-in</h4>
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="username"
          v-model="username"/>
        <input type="text" class="form-control" placeholder="password"
          v-model="password"/>
        <div class="input-group-append">
          <button class="btn btn-outline-secondary" type="button"
            @click="submitLogin"
          >
            Login
          </button>
        </div>
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
      password: ""
    };
  },
  methods: {
    submitLogin() {
      const data = {username: this.username, password: this.password}

      LoginService.login(data)
        .then(response => {
          console.log(response.data)

          // handle token & redirect
          sessionStorage.setItem("auth", response.data.token) // hax

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

<style>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>