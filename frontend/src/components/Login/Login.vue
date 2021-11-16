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
      password: "",
      message: ""
    };
  },
  methods: {
    submitLogin() {
      // TODO: validate & check input

      const data = {username: this.username, password: this.password}

      LoginService.login(data)
        .then(response => {
          console.log(response)
          console.log(this.$route)
          if(response.success) {
            if(this.$route.redirectedFrom) {
              this.$router.push(this.$route.redirectedFrom.fullPath)
            }
            else {
              this.$router.push("/")
            }
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

<style>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>