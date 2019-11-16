<template>
	<div class="tomika-index-section" :class="{ 'image-on-left': $props.imageOnLeft }"
		:style="{ 'background-color': $props.backgroundColor }">
		<div v-if="backgroundImage" class="background-image">
			<img :src="$props.backgroundImage" alt="">
		</div>
		<div class="tomika-column">
			<div class="image">
				<img class="image" :src="$props.image" alt="">
			</div>
			<div class="content">
				<h1>{{ $props.title }}</h1>
				<div><slot></slot></div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: "tomika-index-section",
		props: {
			title: String,
			backgroundColor: {
				type: String,
				default: 'hsla(0,0%,100%,0.1)'
			},
			image: String,
			backgroundImage: String,
			imageOnLeft: {
				type: Boolean,
				default: false
			}
		}
	}
</script>

<style scoped>
	.tomika-index-section {
		position: relative;
		display: flex;
		justify-content: center;
		text-align: center;
		width: 100%;
		margin: 30px;
		padding: 30px 0px;
		background-image: url('/images/stripes.png');
		box-shadow: 0 0px 20px 5px hsla(0,0%,0%,0.5);
		text-shadow: -2px 2px 2px hsla(0,0%,0%,1);
	}
	.image-on-left {
		text-shadow: 2px 2px 2px hsla(0,0%,0%,1);
	}
	h1 {
		line-height: 1.5em;
		margin: 0;
	}
	p {
		font-size: 16px;
		line-height: 1.5em;
	}
	.background-image {
		display: flex;
		flex-direction: row;
		justify-content: center;
		height: 100%;
		mask-image: linear-gradient(to right, transparent 0%, hsla(0,0%,0%,0.5) 15%, hsla(0,0%,0%,1) 25%);
		position: absolute;
		top: 0;
		right: 0;
		pointer-events: none;
		z-index: 0;
		max-width: 40%;
		overflow: hidden;
	}
	.image-on-left .background-image {
		right: auto;
		left: 0;
		mask-image: linear-gradient(to left, transparent 0%, hsla(0,0%,0%,0.5) 15%, hsla(0,0%,0%,1) 25%);
	}
	.background-image img {
		height: 100%;
	}
	.tomika-column {
		display: flex;
		flex-direction: row-reverse;
		align-items: center;
		justify-content: space-between;
		padding-top: 0;
		padding-bottom: 0;
		position: relative;
		z-index: 1;
	}
	.image-on-left .tomika-column {
		flex-direction: row;
	}
	.image {
		width: 40%;
		margin-top: -40px;
		user-select: none;
	}
	.image > img {
		width: 100%;
		filter: drop-shadow(5px 5px 1px hsla(0,0%,0%,0.5));
	}
	.image-on-left .image > img {
		filter: drop-shadow(-5px 5px 1px hsla(0,0%,0%,0.5));
	}
	.content {
		width: 55%;
	}
</style>