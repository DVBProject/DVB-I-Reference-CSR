<template>
  <div class="list row">
      

    <div class="col-md-8">
      <h4>Add Provider</h4>

      <label>Organization Names:</label>
      <button class="btn btn-outline-primary mx-2 mb-1" type="button"
            @click="addNameField"
          >
        +
      </button>
      <div class="input-group mb-3">

        
        <div class="col-sm-12 px-0"
            v-for="(name, index) in Names"
            :key="index">      

          <div class="row my-0 mx-0">

            <div class="form-floating px-0 col-sm-5">          
              <input type="text" id="floatingInput" class="form-control mb-1" placeholder="Name"
                  v-model="name.name"/>
              <label for="floatingInput">Name</label>
            </div>

            <div class="form-floating px-0 col-sm-5">
              <input type="text" id="floatingInput2" class="form-control mx-2 mb-1" placeholder="Type"
                  v-model="name.type"/>
              <label for="floatingInput2">Type</label>
            </div>

          <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
            :id="index"
            @click="delNameField"
          >
            -
          </button>
          </div>

        </div>        
      </div>

        
      

      <label>Organization Kind:</label>
      <input type="text" class="form-control my-2" placeholder="Kind"
          v-model="Kind"/>

      <label>Contact Name:</label>
      <input type="text" class="form-control my-2" placeholder="Contact Name"
          v-model="ContactName"/>

      <label>Jurisdiction:</label>
      <input type="text" class="form-control my-2" placeholder="Jurisdiction"
          v-model="Jurisdiction"/>


      <label>Address:</label>
 
      <div class="form-floating mb-1">
        <input type="text" id="floatingInputStreet" class="form-control my-2" placeholder="Street"
            v-model="Address.street"/>
        <label for="floatingInputStreet">Street</label>
      </div>
      <div class="form-floating mb-1">
        <input type="text" id="floatingInputCity" class="form-control my-2" placeholder="City"
            v-model="Address.city"/>
        <label for="floatingInputCity">City</label>
      </div>
      <div class="form-floating mb-1">
        <input type="text" id="floatingInputPC" class="form-control my-2" placeholder="Post code"
            v-model="Address.postcode"/>
        <label for="floatingInputPC">Post code</label>
      </div>
      <div class="form-floating mb-1">
        <input type="text" id="floatingInputCountry" class="form-control my-2" placeholder="Country"
            v-model="Address.country"/>
        <label for="floatingInputCountry">Country</label>
      </div>





      <label>Electronic Address:</label>
      <input type="text" class="form-control my-2" placeholder="ElectronicAddress"
          v-model="ElectronicAddress"/>

      <label>Regulator:</label><br>
      <div class="btn-group btn-group-sm" role="group" aria-label="Basic radio toggle button group">
        <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" checked>
        <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
 
        <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio">
        <label class="btn btn-outline-primary" for="btnradioNo">No</label>
      </div>

    </div>

    <div class="col-md-4">    

      <div>
        <div class="input-group-append">
            <button class="btn btn-outline-primary" type="button"
            @click="submitProvider">
            Add Provider
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService"
import LoginService from "../../services/LoginService"

export default {
  name: "add-provider",
  data() {
    return {
      providers: [],

      Kind: "",

      Name: "",
      Type: "",
      Names: [],

      ContactName: "",
      Jurisdiction: "",

      Address: {
        street: "",
        city: "",
        postcode: "",
        country: ""
      },

      ElectronicAddress: "",
      Regulator: 1,      
    };
  },
  methods: {
    /*
    retrieveProviders() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },*/
    

    addNameField() {
      this.Names.push({name: "", type: ""})
    },

    delNameField(item) {
      console.log(item.target.id)
      this.Names.splice(item.target.id, 1)
    },

    regulatorRadio(item) {
      if(item.target.id === "btnradioYes") {
        this.Regulator = 1
      } 
      else {
        this.Regulator = 0
      }
    },
    
    submitProvider() {
        const addrstring = JSON.stringify(this.Address)
        const data = {
            Kind: this.Kind,
            Names: this.Names, //JSON.stringify(this.Names),
            name: this.Name,
            type: this.Type,
            ContactName: this.ContactName,
            Jurisdiction: this.Jurisdiction,
            Address: addrstring,
            ElectronicAddress: this.ElectronicAddress,
            Regulator: this.Regulator,
        } 
        console.log("add provider:", data)
        
        ProviderDataService.create(data)
            .then(response => {
                console.log(response)
            })
            .catch(err => {
                console.log(err);
                // TODO: move this handler the service module
                // error with fetch (unauthorized)
                // clear session data & re-login
                LoginService.reset()
            });
    }


  },
  mounted() {
    //this.retrieveProviders();
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