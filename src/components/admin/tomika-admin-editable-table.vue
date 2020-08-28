<template>
	<div class="editable-table-container">
		<div class="table-area">
			<table>
				<tr>
					<th v-for="(col, key) in columns" :key="key">{{ col.colTitle }}</th>
				</tr>
				<tr v-for="(o, key1) in data" :key="key1" :class="{ selected: key1 === selectedRow }"
					@click="selectedRow = key1">
					<td v-for="(col, key2) in columns" :key="key2" :style="{ ...col.style, textAlign: col.isBoolean ? 'center' : 'left' }">
						<template v-if="!col.isBoolean">{{ o[col.propName] }}</template>
						<font-awesome-icon v-else-if="o[col.propName]" icon="check" style="color: hsl(90,30%,50%)"></font-awesome-icon>
						<font-awesome-icon v-else icon="times" style="color: hsl(0,30%,50%)"></font-awesome-icon>
					</td>
				</tr>
			</table>
		</div>
		<div class="edit-zone" v-if="selectedRow !== null">
			<div class="edit-zone-close" @click="selectedRow = null">
				<font-awesome-icon icon="times"></font-awesome-icon>
			</div>
			<div class="edit-zone-prop-list">
				<div v-for="(col, key) in columns" :key="key" class="edit-zone-prop">
					<div class="edit-zone-prop-name">{{ col.colTitle }}</div>
					<div class="edit-zone-value">
						<input type="checkbox" v-if="col.isBoolean" v-model="selectedRowObj[col.propName]">
						<input type="text" v-else-if="col.editable && !col.textarea" v-model="selectedRowObj[col.propName]">
						<textarea type="text" v-else-if="col.editable && col.textarea" v-model="selectedRowObj[col.propName]"></textarea>
						<span v-else>{{ selectedRowObj[col.propName] }}</span>
					</div>
				</div>
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
	 *    - onChange: (Optional) Function to run when the value is changed
	 */

	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Font awesome
	library.add(faTimes, faCheck);

	export default {
		name: "tomika-admin-editable-table",
		components: {
			FontAwesomeIcon
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
			}
		},
		data() {
			return {
				selectedRow: null
			}
		},
		computed: {
			selectedRowObj() {
				return this.selectedRow === null ? null : this.data[this.selectedRow];
			}
		},
		methods: {
			onValueChange() {

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
	cursor: pointer;
}
tr:nth-child(2n) {
	background-color: hsla(0,0%,100%,0.05);
}
tr:hover {
	background-color: hsla(0,0%,100%,0.1);
}
tr.selected {
	background-color: hsla(0,0%,100%,0.2);
}
td, th {
	padding: 8px 16px;
	box-sizing: border-box;
}
.edit-zone {
	position: relative;
	background-color: hsla(0,0%,8%,1);
	height: 300px;
	border-top: 1px solid hsl(180,25%,30%);
	overflow-y: scroll;
}
.edit-zone-close {
	position: absolute;
	top: 0;
	right: 0;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 14px;
	width: 30px;
	height: 30px;
	color: hsla(0,0%,100%,0.5);
	cursor: pointer;
	transition: background-color 100ms, color 100ms;
	border-bottom-left-radius: 8px;
}
.edit-zone-close:hover {
	color: hsla(0,0%,100%,1);
	background-color: hsla(0,0%,100%,0.05);
}
.edit-zone-prop-list {
	display: flex;
	flex-direction: column;
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
</style>