 <template>
  <div v-if="currentProvider" class="edit-form row">

    <div class="col-md-8">
      <h4>Edit Provider</h4>
      <form>
        

        <label>Organization Names:</label>
        <button class="btn btn-outline-primary mx-2 mb-1" type="button"
              @click="addNameField"
            >
          +
        </button>
        <div class="input-group mb-3">

          
          <div class="col-sm-12 px-0"
              v-for="(name, index) in currentProvider.Names"
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



        

        <div class="form-group">
          <label>Organization Kind:</label>
          <input type="text" class="form-control my-2" placeholder="Kind"
              v-model="currentProvider.Kind"/>
        </div>

        
        <div class="form-group">
          <label for="description">Contact name:</label>
          <input type="text" class="form-control my-2" id="contactname"
            v-model="currentProvider.ContactName"
          />
        </div>
        <div class="form-group">
          <label for="description">Jurisdiction:</label>
          <input type="text" class="form-control my-2" id="jurisdiction"
            v-model="currentProvider.Jurisdiction"
          />
        </div>

        
        <label for="description">Address:</label>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputStreet" class="form-control my-2" placeholder="Street"
              v-model="currentProvider.Address.street"/>
          <label for="floatingInputStreet">Street</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputCity" class="form-control my-2" placeholder="City"
              v-model="currentProvider.Address.city"/>
          <label for="floatingInputCity">City</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputPC" class="form-control my-2" placeholder="Post code"
              v-model="currentProvider.Address.postcode"/>
          <label for="floatingInputPC">Post code</label>
        </div>
        <div class="form-floating mb-1">
          <input type="text" id="floatingInputCountry" class="form-control my-2" placeholder="Country"
              v-model="currentProvider.Address.country"/>
          <label for="floatingInputCountry">Country</label>
        </div>



        <div class="form-group">
          <label for="description">Electronic Address:</label>
          <input type="text" class="form-control my-2" id="electronicaddress"
            v-model="currentProvider.ElectronicAddress"
          />
        </div>



        <div class="form-group">
          <label for="description">Regulator:</label><br>
          <div class="btn-group btn-group-sm my-2" role="group" aria-label="Basic radio toggle button group">
            <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" :checked="currentProvider.Regulator">
            <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
    
            <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio" :checked="!currentProvider.Regulator">
            <label class="btn btn-outline-primary" for="btnradioNo">No</label>
          </div>
        </div>
        


      </form>

    </div>

    <div class="col-md-4">
      <div class="btn-group btn-group-sm my-2" role="group">
        <button class="btn btn-outline-danger "
          @click="deleteProvider"
        >
          Delete
        </button>

        <button type="submit" class="btn btn-outline-primary"
          @click="updateProvider"
        >
          Update
        </button>        
      </div>
      <p>{{ message }}</p>
  </div>

  </div>

  <div v-else>
    <br />
    <p>Provider was not found...</p>
  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService";
import LoginService from "../../services/LoginService"
export default {
  name: "tutorial",
  data() {
    return {
      currentProvider: null,
      message: ''
    };
  },
  methods: {
    getProvider(id) {
      ProviderDataService.get(id)
        .then(response => {
          this.currentProvider = response.data;
          try {
            this.currentProvider.Address = JSON.parse(response.data.Address)
          } catch {
            this.currentProvider.Address = response.data.Address
          }
          if(!this.currentProvider.Names) this.currentProvider.Names = []
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
          // TODO: move this handler the service module
          // error with fetch (unauthorized)
          // clear session data & re-login
          LoginService.reset()
        });
    },
    updateProvider() {
      const addrstring = JSON.stringify(this.currentProvider.Address)

      const data = {
            ...this.currentProvider,
            Address: addrstring,
        }

      //console.log("POST",this.currentProvider.Id, data)//this.currentProvider);
      ProviderDataService.update(this.currentProvider.Id, data) //this.currentProvider)
        .then(response => {
          console.log(response.data);
          this.message = 'The Provider was updated successfully!'
          setTimeout(() => {
            this.$router.push({ name: "providers" })
          }, 1000)
        })
        .catch(e => {
          console.log(e);
        });
    },
    deleteProvider() {
      ProviderDataService.delete(this.currentProvider.Id)
        .then(response => {
          console.log(response.data);
          this.message = 'The Provider was deleted successfully!'
          setTimeout(() => {
            this.$router.push({ name: "providers" })
          }, 1000)
        })
        .catch(e => {
          console.log(e);
        });
    },
    addNameField() {
      this.currentProvider.Names.push({name: "", type: ""})
    },
    delNameField(item) {
      console.log(item.target.id)
      this.currentProvider.Names.splice(item.target.id, 1)
    },
    regulatorRadio(item) {
      if(item.target.id === "btnradioYes") {
        this.currentProvider.Regulator = 1
      } 
      else {
        this.currentProvider.Regulator = 0
      }
    },


  },  
  mounted() {
    this.message = '';
    this.getProvider(this.$route.params.id);
  }
};
</script>

<style>
.edit-form {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>