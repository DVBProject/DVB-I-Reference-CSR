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

      <div class="form-group">
        <label for="description">Jurisdiction:</label>
        <div class="form-floating mb-1">
        <input type="text" id="jurisdictionInputName" class="form-control my-2" placeholder="Name"
            v-model="Jurisdiction.Name"/>
        <label for="jurisdictionInputName">Name</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="jurisdictionInputLine1" class="form-control my-2" placeholder="Address line 1"
              v-model="Jurisdiction.AddressLine[0]"/>
          <label for="jurisdictionInputLine1">Address line 1</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="jurisdictionInputLine2" class="form-control my-2" placeholder="Address line 3"
              v-model="Jurisdiction.AddressLine[1]"/>
          <label for="jurisdictionInputLine2">Address line 2</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="jurisdictionInputLine3" class="form-control my-2" placeholder="Address line 3"
              v-model="Jurisdiction.AddressLine[2]"/>
          <label for="jurisdictionInputLine1">Address line 3</label>
        </div>
      </div>

      
      <label for="description">Address:</label>
        <div class="form-floating mb-1">
        <input type="text" id="floatingInputName" class="form-control my-2" placeholder="Name"
            v-model="Address.Name"/>
        <label for="floatingInputName">Name</label>
      </div>
      <div class="form-floating mb-1">
        <input type="text" id="floatingInputLine1" class="form-control my-2" placeholder="Address line 1"
            v-model="Address.AddressLine[0]"/>
        <label for="floatingInputLine1">Address line 1</label>
      </div>
      <div class="form-floating mb-1">
        <input type="text" id="floatingInputLine2" class="form-control my-2" placeholder="Address line 3"
            v-model="Address.AddressLine[1]"/>
        <label for="floatingInputLine2">Address line 2</label>
      </div>
      <div class="form-floating mb-1">
        <input type="text" id="floatingInputLine3" class="form-control my-2" placeholder="Address line 3"
            v-model="Address.AddressLine[2]"/>
        <label for="floatingInputLine3">Address line 3</label>
      </div>

      <div class="form-group">
        <label for="description">Electronic Address:</label>
          <div class="form-floating mb-1">
        <input type="text" id="floatingInputTelephone" class="form-control my-2" placeholder="Telephone"
            v-model="ElectronicAddress.Telephone"/>
        <label for="floatingInputTelephone">Telephone</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputFax" class="form-control my-2" placeholder="Fax"
              v-model="ElectronicAddress.Fax"/>
          <label for="floatingInputFax">Fax</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputEmail" class="form-control my-2" placeholder="Email"
              v-model="ElectronicAddress.Email"/>
          <label for="floatingInputEmail">Email</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputUrl" class="form-control my-2" placeholder="Url"
              v-model="ElectronicAddress.Url"/>
          <label for="floatingInputUrl">Url</label>
        </div>
      </div>
      

      <label>Regulator:</label><br>
      <div class="btn-group btn-group-sm" role="group" aria-label="Basic radio toggle button group">
        <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" >
        <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
 
        <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio" checked>
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
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService"

export default {
  name: "add-provider",
  data() {
    return {
      providers: [],

      Kind: "",

      Name: "",
      Type: "",
      Names: [{name: "", type: ""}],

      ContactName: "",
      Jurisdiction: {
        Name: "",
        AddressLine: ["","",""]
      },

      Address: {
        Name: "",
        AddressLine: ["","",""]
      },

      ElectronicAddress: {Telephone: "",Fax: "",Email:"",Url: ""},
      Regulator: 0,
      message: "",
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
        const jurisdictionstring = JSON.stringify(this.Jurisdiction)
        const electronicaddr = JSON.stringify(this.ElectronicAddress);
        const data = {
            Kind: this.Kind,
            Names: this.Names, //JSON.stringify(this.Names),
            type: this.Type,
            ContactName: this.ContactName,
            Jurisdiction: jurisdictionstring,
            Address: addrstring,
            ElectronicAddress: electronicaddr,
            Regulator: this.Regulator,
        } 
        console.log("add provider:", data)
        
        ProviderDataService.create(data)
            .then(response => {
                console.log(response)
                setTimeout(() => {
                   this.$router.push({ name: "providers" });
                }, 2000)
            })
            .catch(err => {
              console.log(err.response.data);
                this.message = 'Error:'+err.response.data.message;
            });
    }


  },
  mounted() {
    //this.retrieveProviders();
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