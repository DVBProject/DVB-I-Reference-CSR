<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark px-2">
      <router-link to="/" class="navbar-brand">DVB-I CSR</router-link> 
      <div class="navbar-nav mr-auto">

        <li class="nav-item">
          <router-link to="/servicelists" class="nav-link">Service Lists</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/add-servicelist" class="nav-link">Add Service List</router-link>
        </li>

        <li class="nav-item">
          <router-link to="/providers" class="nav-link">Providers</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/add-provider" class="nav-link">Add Provider</router-link>
        </li>
        <li class="nav-item" v-if="user_role">
          <router-link to="/admin" class="nav-link">Admin</router-link>
        </li>
        <li class="nav-item" v-if="user_role">
          <router-link to="/settings" class="nav-link">Settings</router-link>
        </li>

      </div>
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
      user_role: false,
    }
  },
  mounted() {
    this.user_role = JSON.parse(sessionStorage.getItem('user')).is_admin
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
</style>
