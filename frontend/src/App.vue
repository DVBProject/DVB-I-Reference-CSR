<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark px-2">
      <router-link to="/" class="navbar-brand">DVB-I CSR</router-link> 
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item" >
            <router-link to="/servicelists" class="nav-link">Service Lists</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/providers" class="nav-link">Providers</router-link>
          </li>
          <li class="nav-item" v-if="user && user.role">
            <router-link to="/admin" class="nav-link">Admin</router-link>
          </li>
          <li class="nav-item" v-if="user && user.role">
            <router-link to="/settings" class="nav-link">Settings</router-link>
          </li>

          <li class="nav-item dropdown">
            <i class="bi-person-square nav-link nav-icon" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false" id="profileButton" aria-label="profile"></i>         
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileButton">
              <li v-if="!user"><a class="dropdown-item" href="/login">Sign in</a></li>
              <li v-if="false"><a class="dropdown-item" href="#">Register</a></li>
              <li v-if="user"><a class="dropdown-item" href="/profile" >Profile</a></li>
              <li v-if="user"><hr class="dropdown-divider"></li>
              <li v-if="user"><a class="dropdown-item" href="/logout">Log out</a></li>
            </ul>
          </li>
          <!--
          <li class="nav-item invisible">
            <router-link to="/add-servicelist" class="nav-link">Add Service List</router-link>
          </li>
          <li class="nav-item invisible">
            <router-link to="/add-provider" class="nav-link">Add Provider</router-link>
          </li>
          -->
        </ul>
      </div>
      <span class="navbar-text">Version: {{version}}, Built: {{ buildDate }} </span>
    </nav>

    <div class="container mt-3">
      <router-view />
    </div>
  </div>
</template>


<script>
export default {
  name: 'App',
  data() {
    return {
      version: "0.15"
    }
  },
  computed: {
    user() {
      let user = false
      try {
        user = JSON.parse(sessionStorage.getItem('user'))
      }
      catch {
        user = false
      }
      return user
    },
    buildDate() {
      let value =  new Date(
        document
          .querySelector("meta[name='build_date']")
          .getAttribute('content')
      );
      const date = value.getDate();
      const month = value.getMonth() + 1;
      const year = value.getFullYear();
      const hour = value.getHours();
      let minutes = value.getMinutes();
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      return date + '.' + month + '.' + year+ " "+hour+":"+minutes ;
    }
  },
  mounted() {

  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.nav-icon {
  font-size: 1.1rem;
}

nav a.router-link-active,
nav a.router-link-exact-active {
  text-decoration: underline;
  color: white!important;
}
.navbar-brand {
  text-decoration: none!important;
}
</style>
