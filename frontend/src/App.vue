<template>
  <div id="app">
    <nav class="navbar navbar-expand navbar-dark bg-dark">
      <router-link to="/" class="navbar-brand">DVB-I CSR</router-link>
      <div class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link to="/providers" class="nav-link">Provider</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/add-provider" class="nav-link">Add Provider</router-link>
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
