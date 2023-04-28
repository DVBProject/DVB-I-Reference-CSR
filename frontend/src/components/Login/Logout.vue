<template>
  <div class="list row">
    <div class="col-md-12">
      <h4>You have been logged out.</h4>
    </div>
  </div>
</template>

<script>
  import LoginService from "../../services/LoginService";
  export default {
    name: "logout-view",
    data() {
      return {
        username: "",
        password: "",
        message: "",
      };
    },
    methods: {
      submitLogout() {
        LoginService.logout()
          .then((response) => {
            if (response) {
              //console.log("login ui", response)
              //console.log(this.$route)
            }

            setTimeout(() => {
              //this.$router.push("/");
              window.location = "/";
            }, 2000);
          })
          .catch((e) => {
            console.log(e);
          });
      },
    },
    mounted() {
      this.submitLogout();
    },
  };
</script>

<style scoped>
  .list {
    text-align: left;
    max-width: 750px;
    margin: auto;
  }
</style>
