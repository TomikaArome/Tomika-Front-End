<template>
	<div class="editable-table-container" :class="{ 'no-change': noChange }">
		<div class="table-area">
			<table>
				<tr class="header-row">
					<th v-for="(col, key) in columns" :key="key">{{ col.colTitle }}</th>
				</tr>
				<tr v-for="(o, key1) in data" :key="key1" :class="{ selected: o[idPropName] === selectedRowId }"
					@click="openEditZone(o[idPropName])">
					<td v-for="(col, key2) in columns" :key="key2" :style="{ ...col.style, textAlign: col.isBoolean ? 'center' : 'left' }">
						<template v-if="!col.isBoolean">{{ o[col.propName] }}</template>
						<font-awesome-icon v-else-if="o[col.propName]" icon="check" style="color: hsl(90,30%,50%)"></font-awesome-icon>
						<font-awesome-icon v-else icon="times" style="color: hsl(0,30%,50%)"></font-awesome-icon>
					</td>
				</tr>
				<tr v-if="!noChange && !noAdd" class="new-record-row" :class="{ selected: selectedRowEditing !== null && selectedRowId === null }"
					@click="openEditZone()">
					<td colspan="1000"><font-awesome-icon icon="plus"></font-awesome-icon> Add new</td>
				</tr>
			</table>
		</div>
		<div class="edit-zone" v-if="selectedRowEditing !== null">
			<div class="edit-zone-prop-list">
				<div v-for="(col, key) in columns" :key="key" class="edit-zone-prop">
					<div class="edit-zone-prop-name">{{ col.colTitle }}</div>
					<div class="edit-zone-value">
						<input type="checkbox" v-if="col.isBoolean" v-model="selectedRowEditing[col.propName]">
						<input type="text" v-else-if="col.editable && !col.textarea" v-model="selectedRowEditing[col.propName]">
						<textarea type="text" v-else-if="col.editable && col.textarea" v-model="selectedRowEditing[col.propName]"></textarea>
						<span v-else>{{ selectedRowEditing[col.propName] }}</span>
					</div>
				</div>
			</div>
			<div class="edit-zone-confirmation">
				<button class="edit-zone-delete-button notFilled red" v-if="!noDelete && selectedRowId !== null"
						@click="deleteRow" :disabled="waiting > 0">
					<font-awesome-icon v-if="waiting === 2" icon="circle-notch" spin></font-awesome-icon>
					<template v-else>Delete</template>
				</button>
				<tomika-block-message :style="{ opacity: editZoneError === '' ? 0 : 1 }" type="error">{{ editZoneError }}</tomika-block-message>
				<button class="edit-zone-confirm-button" @click="confirmRowChanges" :disabled="waiting > 0">
					<font-awesome-icon v-if="waiting === 1" icon="circle-notch" spin></font-awesome-icon>
					<template v-else>Confirm</template>
				</button>
				<button class="edit-zone-cancel-button notFilled" @click="closeEditZone" :disabled="waiting > 0">Close</button>
			</div>
		</div>
	</div>
</template>

<script>
	/**
	 * This component requires three props:
	 *  - idPropName: A string containing the identifying property name (the column that identifies a row)
	 *  - data: An array of data to fill the table with. The array is filled with objects that contain the "propName"s
	 *  as specified by the columns prop
	 *  - columns: An array of object containing information about each of the columns in the table. Each object should
	 *  contain the following:
	 *    - propName: The name of the prop that the column will use when searching for the value
	 *    - colTitle: The title at the top of the column
	 *    - style: (Optional) Object of styles properties for the cells of the column (optional)
	 *    - editable: (Optional) Boolean that determines whether or not the property is editable. Defaults to false
	 *    - textarea: (Optional) Boolean that determines whether or not the input field will be a textarea. Defaults to
	 *    false
	 *    - isBoolean: (Optional) Boolean that determines whether or not the value is a boolean. Defaults to false
	 *    - validator: (Optional) Function to run to test if the value provided for this column is correctly validated.
	 *    If the value returned by this function is true, the value is valid and not if otherwise. If the value returned
	 *    is a string, that string will be shown as an error message. Takes an object as a parameter with the
	 *    following properties:
	 *      - newValue: The new value
	 *      - oldValue: The old value
	 *      - newObject: The object containing all the new values after change
	 *      - oldObject: The object containing all the old value before change
	 *      - data: The rest of the data
	 *
	 * It also has a few optional props:
	 *  - noAdd: Boolean which, if set to true, forbids the addition of new rows. Note that if noChange is set to true,
	 *  adding is already disabled
	 *  - noDelete: Boolean which, if set to true, forbids the deletion of rows
	 *  - onDelete: Function to run when the delete button for a row is pressed. It takes the row object as its only
	 *  parameter and if false is returned, it will cancel the deletion of the row. If a string is returned, it will
	 *  also chancel the deletion, but this string will act as an error message
	 *  - noChange: Boolean which, if set to true, forbids the modification of any row in the table
	 *  - onChange: Function to run when the confirm button for a row is pressed. It take two parameters:
	 *    - newObj: The new row object
	 *    - oldObj: The old row object. If set to null, that means it's a new row
	 *    The return value also affects how the change will be handled:
	 *    - If the return value is a string, the change will not be confirmed and the string will be shown as an error
	 *    - If the return value is an object, the change is confirmed, but it will use the contents of the object to
	 *    update the table
	 *    - If anything else is returned, it is treated as a boolean and confirm if true or reject the change if false
	 */

	// Import dependencies
	import tomikaBlockMessage from './tomika-block-message';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faTimes, faCheck, faPlus, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Font awesome
	library.add(faTimes, faCheck, faPlus, faCircleNotch);

	export default {
		name: "tomika-admin-editable-table",
		components: {
			FontAwesomeIcon,
			tomikaBlockMessage
		},
		props: {
			idPropName: {
				type: String,
				required: true
			},
			data: {
				type: Array,
				required: true
			},
			columns: {
				type: Array,
				required: true,
				validator: (arr) => {
					let r = true;
					for (let o of arr) {
						if (typeof o !== 'object' || typeof o.propName !== 'string' || typeof o.colTitle !== 'string') { r = false; }
					}
					return r;
				}
			},
			noAdd: {
				type: Boolean,
				default: false
			},
			noDelete: {
				type: Boolean,
				default: false
			},
			onDelete: {
				type: Function,
				default: () => { return true; }
			},
			noChange: {
				type: Boolean,
				default: false
			},
			onChange: {
				type: Function,
				default: () => { return true; }
			}
		},
		data() {
			return {
				selectedRowId: null,
				selectedRowEditing: null,
				editZoneError: '',
				waiting: 0 // 0 for no waiting, 1 for waiting for change, 2 for waiting for deletion
			}
		},
		computed: {
			selectedRow() {
				return this.selectedRowId === null ? null : this.data.find((o) => { return o[this.idPropName] === this.selectedRowId; });
			},
			selectedRowIndex() {
				return this.selectedRowId === null ? null : this.data.findIndex((o) => { return o[this.idPropName] === this.selectedRowId; });
			}
		},
		methods: {
			/**
			 * Opens the edit zone with the data of the specified key
			 * @param rowId The ID of the row that identifies which object the selected row is referring to. If not
			 * specified, the edit zone refers to a new record
			 */
			openEditZone(rowId) {
				// Check the table is editable
				if (this.noChange) { return; }
				// Reset the edit zone error message
				this.selectedRowEditing = null;
				this.selectedRowId = null;
				this.editZoneError = '';
				// Check if we're creating a new record or updating an existing one
				if (typeof rowId === 'undefined') {
					this.selectedRowEditing = {};
				} else {
					// Get the row
					let row = this.data.find((o) => {
						return o[this.idPropName] === rowId;
					});
					// Check the object with that key exists
					if (typeof row === 'object') {
						// Backup the state of the object as is for eventually reverting changes
						this.selectedRowEditing = Object.assign({}, row);
						// Save the ID
						this.selectedRowId = rowId;
					}
				}
			},

			/**
			 * Closes the edit zone
			 */
			closeEditZone() {
				// Clear properties
				this.selectedRowEditing = null;
				this.selectedRowId = null;
			},

			/**
			 * Confirms the row changes by communicating them to the backend and then updating the main data array
			 */
			async confirmRowChanges() {
				let valuesValid = true, invalidColTitle = '', validatorReturn = false;
				// Check that the ID column would be unique after the change
				let idPropSearchIndex = this.data.findIndex((o) => { return this.selectedRowEditing[this.idPropName] === o[this.idPropName] });
				if (idPropSearchIndex !== -1 && idPropSearchIndex !== (this.selectedRowIndex === null ? -1 : this.selectedRowIndex)) {
					let colTitle = this.columns.find((o) => { return o.propName === this.idPropName; }).colTitle;
					this.editZoneError = `The value of "${colTitle}" should be unique`;
				} else {
					// Validate each property
					for (let col of this.columns) {
						if (typeof col.validator === 'function') {
							let validatorParams = {
								newValue: this.selectedRowEditing[col.propName],
								oldValue: null,
								newObject: this.selectedRowEditing,
								oldObject: null,
								data: this.data
							};
							if (this.selectedRowId !== null) {
								validatorParams.oldValue = this.selectedRow[col.propName];
								validatorParams.oldObject = this.selectedRow;
							}
							validatorReturn = col.validator(validatorParams);
							if (validatorReturn === false || typeof validatorReturn === 'string') {
								valuesValid = false;
								invalidColTitle = col.colTitle;
								break;
							}
						}
					}
					if (valuesValid) {
						// Run the onChange prop function
						this.waiting = 1;
						let onChangeReturn = await this.onChange(this.selectedRowEditing, this.selectedRowId === null ? null : this.selectedRow);
						this.waiting = 0;
						if ((onChangeReturn || onChangeReturn === undefined) && (typeof onChangeReturn !== 'string')) {
							// If the return value is an object the data should use the data from the return object in priority
							if (typeof onChangeReturn === 'object') {
								for (let col of this.columns) {
									if (typeof onChangeReturn[col.propName] !== 'undefined') {
										this.selectedRowEditing[col.propName] = onChangeReturn[col.propName];
									}
								}
							}
							// Update the main data array
							if (this.selectedRowId === null) {
								this.data.push(this.selectedRowEditing);
							} else {
								this.$set(this.data, this.selectedRowIndex, this.selectedRowEditing);
							}
							// Reopen the editing zone with the same (or new) ID so it refreshes the editing object
							this.openEditZone(this.selectedRowEditing[this.idPropName]);
						} else {
							// Inform the user the change could not be confirmed
							this.editZoneError = typeof onChangeReturn === 'string' ? onChangeReturn : 'An error occurred';
						}
					} else {
						// Inform the user there was invalid data somewhere
						this.editZoneError = `Please check "${invalidColTitle}" for invalid data${validatorReturn === false ? '.' : ': ' + validatorReturn}`;
					}
				}
			},

			/**
			 * Deletes the row currently being edited
			 */
			async deleteRow() {
				// For extra assurance, check the component is set to allow row deletion
				if (this.noDelete) { return; }
				// Run the onDelete function
				this.waiting = 2;
				let onDeleteReturn = await this.onDelete(this.selectedRow);
				this.waiting = 0;
				if ((onDeleteReturn || onDeleteReturn === undefined) && (typeof onDeleteReturn !== 'string')) {
					// Get the index
					let index = this.selectedRowIndex;
					// Clear properties
					this.selectedRowEditing = null;
					this.selectedRowId = null;
					this.editZoneError = '';
					// Delete the row from the data array
					this.data.splice(index, 1);
				} else {
					// Inform the user the row could not be deleted
					this.editZoneError = typeof onDeleteReturn === 'string' ? onDeleteReturn : 'An error occurred';
				}
			}
		}
	}
</script>

<style scoped>
.editable-table-container {
	position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;
}
.table-area {
	flex-grow: 1;
	overflow: scroll;
	max-width: 100%;
}
table {
	min-width: 100%;
	border-collapse: collapse;
	font-size: 0.8em;
}
tr {
	min-width: 100%;
	transition: background-color 100ms;
}
tr:nth-child(2n) {
	background-color: hsla(0,0%,100%,0.05);
}
.editable-table-container:not(.no-change) tr:not(.header-row):hover {
	background-color: hsla(0,0%,100%,0.1);
	cursor: pointer;
	user-select: none;
}
tr.selected {
	background-color: hsla(0,0%,100%,0.2);
}
td, th {
	padding: 8px 16px;
	box-sizing: border-box;
}
.header-row {
	user-select: none;
}
.new-record-row {
	user-select: none;
	font-style: italic;
}
.new-record-row svg {
	margin-right: 4px;
}
.edit-zone {
	position: relative;
	background-color: hsla(0,0%,8%,1);
	height: 300px;
	border-top: 1px solid hsl(180,25%,30%);
	display: flex;
	flex-direction: column;
}
.edit-zone-prop-list {
	display: flex;
	flex-direction: column;
	flex-shrink: 1;
	flex-grow: 1;
	overflow-y: scroll;
}
.edit-zone-prop {
	display: flex;
	flex-direction: row;
}
.edit-zone-prop:nth-child(2n) {
	background-color: hsla(0,0%,100%,0.05);
}
.edit-zone-prop-name {
	padding: 12px 8px;
	font-weight: bold;
	text-align: right;
	width: 200px;
}
.edit-zone-value {
	padding: 8px;
	flex-grow: 1;
}
input[type=text], textarea {
	background: hsla(0,0%,5%,1);
	color: inherit;
	width: calc(100% - 30px);
	resize: vertical;
}
textarea {
	min-height: 4em;
}
.edit-zone-confirmation {
	background-color: hsl(0,0%,5%);
	padding: 4px;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
}
.edit-zone-confirmation > button {
	width: 100px;
	margin: 0 4px;
}
.edit-zone-confirmation > .tomika-block-message {
	margin: 0 8px;
	flex-grow: 1;
	font-size: 10px;
}
</style>