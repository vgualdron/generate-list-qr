<template>
  <b-jumbotron>
    <h3>Escriba la lista para generar los QR</h3>
    <b-card class="text-center">
      <b-row>
        <b-col lg="6" class="my-1">
          <b-form-group
            label="Filtro"
            label-for="filter-input"
            label-cols-sm="3"
            label-align-sm="right"
            label-size="sm"
            class="mb-0"
          >
            <b-input-group size="sm">
              <b-form-input
                id="filter-input"
                v-model="filter"
                type="search"
                placeholder="Escriba el texto a buscar"
              ></b-form-input>

              <b-input-group-append>
                <b-button :disabled="!filter" @click="filter = ''">Limpiar</b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
      </b-row>
      <b-button @click="actionAdd" class="float-right">Agregar fila</b-button>
      <b-table
        striped
        hover
        responsive
        :items="items"
        :fields="fields"
        :filter="filter"
        :filter-included-fields="filterOn"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :sort-direction="sortDirection"
        stacked="md"
        show-empty
        small
        @filtered="onFiltered">
        <template #cell(reference)="row">
          {{ row.item.reference }}
        </template>
        <template #cell(name)="row">
          {{ row.item.name }}
        </template>

        <template #cell(actions)="row">
          <b-button size="sm" @click="actionEdit(row.item, row.index, $event.target)" class="mr-1">
            Editar
          </b-button>
          <b-button size="sm" @click="actionRemove(row.item, row.index, $event.target)">
            Eliminar
          </b-button>
        </template>
      </b-table>
      <vue-qrcode v-if="items && items.lenght > 0" value="https://www.1stg.me" />
    </b-card>
    <b-modal
      v-model="modalShow"
      :title="modalTitle"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <b-form @submit="itemAdd" @reset="resetModal">
        <b-form-group
          id="input-group-1"
          label="Referencia:"
          label-for="input-reference"
          description="Escribe la referencia"
        >
          <b-form-input
            id="input-reference"
            v-model="item.reference"
            type="text"
            placeholder="Referencia"
            required
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="input-group-name"
          label="Nombre:"
          label-for="input-name"
          description="Escribe el nombre"
        >
          <b-form-input
            id="input-name"
            v-model="item.name"
            type="text"
            placeholder="Nombre"
            required
          ></b-form-input>
        </b-form-group>

        <!-- <b-form-group
          id="input-group-price"
          label="Precio:"
          label-for="input-price"
          description="Escribe el precio"
        >
          <b-form-input
            id="input-price"
            v-model="item.price"
            type="text"
            placeholder="Precio"
            required
          ></b-form-input>
        </b-form-group>

        <b-form-group
          id="input-group-1"
          label="Cantidad:"
          label-for="input-quantity"
          description="Escribe la cantidad"
        >
          <b-form-input
            id="input-quatity"
            v-model="item.quatity"
            type="text"
            placeholder="Cantidad"
            required
          ></b-form-input>
        </b-form-group> -->

      </b-form>
    </b-modal>
  </b-jumbotron>
</template>
<script>
import VueQrcode from 'vue-qrcode'
export default {
  components: {
    VueQrcode
  },
  data () {
    return {
      totalRows: 1,
      sortBy: '',
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      filterOn: [],
      modalTitle: '',
      action: '',
      modalShow: false,
      responsive: true,
      fields: [
        {
          key: 'reference',
          label: 'Referencia'
        },
        {
          key: 'name',
          label: 'Nombre'
        },
        {
          key: 'actions',
          label: 'Acciones'
        }
      ],
      item: {},
      items: []
    }
  },
  watch: {
    action (val) {
      switch (val) {
        case 'insert':
          this.modalTitle = 'Nuevo registro'
          break
        case 'edit':
          this.modalTitle = 'Editar registro'
          break
        default:
          this.modalTitle = 'Eliminar registro'
          break
      }
    }
  },
  computed: {
    sortOptions () {
      // Create an options list from our fields
      return this.fields.filter(f => f.sortable).map((f) => {
        return { text: f.label, value: f.key }
      })
    }
  },
  mounted () {
    // Set the initial number of items
    this.totalRows = this.items.length
  },
  methods: {
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    showModal () {
      this.modalShow = true
    },
    hideModal () {
      this.modalShow = false
    },
    createObject () {
      return {
        id: '',
        reference: '',
        name: '',
        price: '',
        quantity: ''
      }
    },
    actionAdd () {
      this.showModal()
      this.action = 'insert'
      this.item = this.createObject()
    },
    itemAdd () {
      this.items.push(this.item)
      this.hideModal()
    },
    actionEdit (item, index, target) {
      this.item = item
      this.showModal()
      this.action = 'edit'
    },
    resetModal () {
      this.item = { ...this.createObject() }
    },
    handleOk (bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault()
      if (this.action === 'insert') {
        this.itemAdd()
      }
    }
  }
}
</script>
<style scoped>
  .float-right {
    float: right;
    margin-bottom: 10px;
  }
</style>
