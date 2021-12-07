 <template>
  <div v-if="currentProvider" class="edit-form row">

    <div class="col-md-8">
      <h4>Edit Provider</h4>
      <form>
        
        <div class="form-group">
          <label for="name">Organization name:</label>
          <input type="text" class="form-control my-2" id="name"
            v-model="currentProvider.name"
          />
        </div>

        <div class="form-group">
          <label for="type">Organization type:</label>
          <input type="text" class="form-control my-2" id="type"
            v-model="currentProvider.type"
          />
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
          <label for="description">Regulator:</label>
          <input type="checkbox" class="form-check-input" id="regulator"
            v-model="currentProvider.Regulator"
          />
        </div>


      </form>

    </div>

    <div class="col-md-4">
    <button class="badge badge-danger mr-2"
      @click="deleteProvider"
    >
      Delete
    </button>

    <button type="submit" class="badge badge-success"
      @click="updateProvider"
    >
      Update
    </button>
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
          this.currentProvider.Address = JSON.parse(response.data.Address)
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    updateProvider() {
      const addrstring = JSON.stringify(this.currentProvider.Address)

      const data = {
            ...this.currentProvider,
            Address: addrstring,
        }

        console.log("POST",this.currentProvider.Id, data)//this.currentProvider);
      ProviderDataService.update(this.currentProvider.Id, data) //this.currentProvider)
        .then(response => {
          console.log(response.data);
          this.message = 'The Provider was updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
    },
    deleteProvider() {
      ProviderDataService.delete(this.currentProvider.Id)
        .then(response => {
          console.log(response.data);
          this.$router.push({ name: "providers" });
        })
        .catch(e => {
          console.log(e);
        });
    }
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