<template>
	<div class="tomika-image-banner">
		<div class="banner" v-for="(image, index) in $props['images']" v-bind:key="image.url"
			:style="{ opacity: i === index ? '1' : '', 'pointer-events': i === index ? '' : 'none' }">
			<div class="background-image" :style="bannerStyle(image)"></div>
			<div class="caption" v-if="image.caption" :class="image.captionPos">
				<h1>{{ image.caption }}</h1>
				<template v-if="image.description">
					<hr>
					<div class="description">{{ image.description }}</div>
				</template>
				<template v-if="image.twitterCredit">
					<hr>
					<div class="credit">
						Image credit: <tw-link :handle="image.twitterCredit"></tw-link>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import TwLink from "../wrappers/tw-link";
	export default {
		name: 'tomika-image-banner',
		components: {TwLink},
		props: {
			changeRate: { type: Number, default: 15000 },
			images: {
				type: Array,
				validator: (arr) => {
					for (let i in arr) {
						if (typeof arr[i] !== 'object' || typeof arr[i].url !== 'string') { return false; }
						if (typeof arr[i].captionPos !== 'undefined' && ['top-left', 'top-right', 'bottom-left',
							'bottom-right'].indexOf(arr[i].captionPos) === -1) { return false; }
					}
					return true;
				}
			}
		},
		data() {
			return {
				i: 0,
				maintainOpacity: []
			}
		},
		mounted() {
			// Start an interval which cycles the images in the banner
			setTimeout(() => { this.nextImage(); }, this.$props.changeRate);
		},
		methods: {
			bannerStyle(img) {
				return {
					'background-image': `url('${img.url}')`,
					'background-position': `${typeof img.posX !== 'undefined' ? img.posX : '50%'} ${typeof img.posY !==
					'undefined' ? img.posY : '50%'}`,
					'filter': typeof img.filter !== 'undefined' ? img.filter : ''
				}
			},
			nextImage() {
				const curr = this.i;
				this.i = curr + 1 >= this.$props['images'].length ? 0 : curr + 1;
				setTimeout(() => { this.nextImage(); }, this.$props.changeRate);
			}
		}
	}
</script>

<style scoped>
	.tomika-image-banner {
		position: relative;
		width: 100%;
		height: 500px;
	}
	.banner {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		transition: opacity 1000ms;
		opacity: 0;
	}
	.background-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		filter: contrast(120%) sepia(30%);
		mask-image: linear-gradient(to top, transparent 0%, hsla(0,0%,0%,0.5) 15%, hsla(0,0%,0%,1) 25%);
	}
	.caption {
		position: absolute;
		background: hsla(0,0%,0%,0.8);
		border: 1px solid hsla(0,0%,100%,0.4);
		border-radius: 6px;
		padding: 8px 12px;
		font-size: 12px;
		color: hsl(0,0%,70%);
		max-width: 200px;
		opacity: 0.5;
		transition: opacity 150ms;
		user-select: none;
	}
	.caption:hover {
		opacity: 1;
	}
	.caption h1 {
		margin: 0;
		font-size: 1.2em;
		font-family: inherit;
		font-weight: bold;
	}
	.top-left { top: 50px; left: 50px; text-align: left; }
	.top-right { top: 50px; right: 50px; text-align: right; }
	.bottom-left { bottom: 50px; left: 50px; text-align: left; }
	.bottom-right { bottom: 50px; right: 50px; text-align: right; }
	hr {
		margin: 8px 0;
	}
	@media (max-width: 700px) {
		.caption { display: none; }
	}
</style>