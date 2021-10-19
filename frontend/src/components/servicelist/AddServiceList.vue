<template>
  <div class="list row">
      
    <div class="col-md-8">
      <h4>Add Service List</h4>

      <label>Name:</label>
      <input type="text" class="form-control my-2" placeholder="List Name"
          v-model="Name"/>

      <label>Language:</label>
      <input type="text" class="form-control my-2" placeholder="Language"
          v-model="lang"/>

      <label>URI:</label>
      <input type="text" class="form-control my-2" placeholder="URI"
          v-model="URI"/>

      <label>Provider:</label>
      <select class="form-control my-2" placeholder="Provider"
          v-model="Provider">
        <option
            v-for="item in providers"
            v-bind:key="item.Id"
            v-bind:value="item.Id"
         >{{item.Kind}}</option>
      </select>

      <label>Regulator list:</label>
      <input type="text" class="form-control my-2" placeholder="List index"
          v-model="RegulatorList"/>

      <label>Delivery:</label>
      <input type="text" class="form-control my-2" placeholder="Delivery"
          v-model="Delivery"/>
  
    </div>

    <div class="col-md-4">

        <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button"
            @click="addList">
            Add List
            </button>
        </div>
    </div>

  </div>
</template>

<script>
import ServiceListDataService from "../../services/ServiceListDataService"
import ProviderDataService from "../../services/ProviderDataService"
export default {
  name: "add-servicelist",
  data() {
    return {
      providers: [],
      Name: "",
      URI: "",
      lang: "",
      Provider: 0,
      RegulatorList: 0,
      Delivery: ""
           
    };
  },
  methods: {
    retrieveLists() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
          console.log("lists:", response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    
    addList() {
        const data = {
            Name: this.Name,
            URI: this.URI,
            lang: this.lang,
            Provider: this.Provider,
            RegulatorList: this.RegulatorList,
            Delivery: this.Delivery            
        } 

        ServiceListDataService.create(data)
            .then(response => {
                console.log(response)
            })
            .catch(err => {
                console.log(err);
            });
    }

  },
  mounted() {
      this.retrieveLists()
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