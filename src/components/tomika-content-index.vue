<template>
	<div id="tomika-content-index">
		<tomika-image-banner :images="bannerImages" />
		<div class="title-row">
			<img class="title-pfp" src="/images/pfp.png">
			<div class="title-tomika-ink">
				<img src="/images/tomika.ink.svg">
				<div class="caption">Profile picture credit: <a href="https://twitter.com/mintymochaart" target="_blank">@mintymochaart</a></div>
			</div>
		</div>
		<tomika-index-section title="Ayo! I'm Tomika!" image="/images/art/Tomika.png" image-on-left
			background-color="hsl(180,35%,25%)">
			<p>I'm Tomika! A 22 year old enthusiastic Splatoon 2 player, artist and developer. This website is a little presentation to myself, my projects and my life! I have a large variety of hobbies, most of which are creative.</p>
			<p>Most of my friends are from the Splatoon community, with many coming from the UK. Splatoon has done plenty to shape my life and my hobbies, and so I am extremely thankful towards the game and the friends who are always there for me!</p>
			<div class="name-origin">
				<div>Origin of my names:</div>
				<h2><span v-for="(fragment, i) in nameFragments" :key="i" :class="{ highlighted: nameOrigin[nameIndex].fragments.indexOf(i) !== -1 }">{{ fragment }}</span></h2>
				<div>{{ nameOrigin[nameIndex].description }}</div>
			</div>
			<p class="caption">Pictured: Self made art of my squid OC, named after myself.</p>
		</tomika-index-section>
		<tomika-index-section title="My Splatoon 2 competitive team - Kemistry" background-color="hsl(0,35%,25%)"
			background-image="/images/banners/i65-side-view.jpg">
			<p>One of my most treasured things is my competitive Splatoon team, Kemistry. These lovable eejits are more than just teammates to me, they are close friends and have given me more enjoyable times this last year than I've experienced the entire rest of my life!</p>
			<p>Kemistry's captain is Zari. It is (unofficially) co-captained by me and Cynthie. The other full time members are Benji, Callie and Lew. Our former members are still treasured just as much, namely Jack, Seph, MooDee. We also have many friends from within the community who we love chatting and playing with!</p>
			<p>We've played many hours together, Splatoon and other games, participated in tourneys and LANs and met up several times.</p>
			<p>Be sure to join <a href="https://discord.gg/y4vkuMB" target="_blank">our Discord server</a> to join in on the fun!</p>
			<p class="caption">Pictured: MooDee, Zari, Cynthie and I playing on stage at the Splatoon UK championship 2019 at Insomnia 65. Credit to <a target="_blank" href="https://twitter.com/SephSquid">@SephSquid</a> for the picture.</p>
		</tomika-index-section>
	</div>
</template>

<script>
	// Import components
	import tomikaImageBanner from './tomika-image-banner';
	import tomikaIndexSection from './tomika-index-section';

	export default {
		name: "tomika-content-index",
		components: {
			tomikaImageBanner,
			tomikaIndexSection
		},
		data() {
			return {
				bannerImages: [
					{
						url: '/images/banners/kemistry-meetup-park.jpg',
						posX: '47%',
						posY: '20%',
						caption: 'Kemistry meet-up #2',
						captionPos: 'top-right',
						description: 'Kemistry had a second meet-up in the summer of 2019. Pictured here from left to right: Cynthie, Zari, MooDee, me.',
						twitterCredit: 'SephSquid'
					},
					{
						url: '/images/banners/london-bridge.png',
						caption: 'On London bridge with Vincent and Cynthie',
						captionPos: 'bottom-right',
						description: 'The Sunday evening of MozFest 2019, we went on a hunt for a dessert cafe, only to not find it and find ourselves on London bridge instead.',
						twitterCredit: 'vlee888'
					},
					{
						url: '/images/banners/egx-2019-kemistry.jpg',
						posY: '40%',
						caption: 'Kemistry at EGX 2019',
						captionPos: 'top-left',
						description: 'Kemistry participated in the Splatoon UK championship 2019 qualifier at EGX. We got to the semi-finals! Pictured here from left to right: Callie, Cynthie, Lew, me.',
						twitterCredit: 'Lewieboy124'
					},
					{
						url: '/images/banners/eu-champs-group-photo.jpg',
						posY: '20%',
						caption: 'Splatoon European championships 2019',
						captionPos: 'bottom-left',
						description: 'I attended the Splatoon 2019 European championships in Paris with many of the UK community.'
					},
					{
						url: '/images/banners/eu-champs-paris.jpg',
						posY: '40%',
						caption: 'Paris with the Splatoon UK community',
						captionPos: 'bottom-right',
						description: 'While attending the Splatoon 2019 European championships, we visited some of Paris, including the Louvre.',
						twitterCredit: 'kitsuneSpl'
					}
				],
				nameFragments: ['κε', ' ', 'To', 'm', 'i', 'ka', ' ', 'Arome'],
				nameOrigin: [
					{ fragments: [0], description: 'Kemistry\'s tag, composed of the lowercase kappa κ and the lowercase epsilon ε.' },
					{ fragments: [2, 3], description: 'Shortened variant of my real first name, Thomas.' },
					{ fragments: [4, 5], description: 'The japanese for "squid", in roman letters.' },
					{ fragments: [2, 3, 4], description: 'Tomi (and sometimes Tommy) is my male nickname which I rarely go by these days.' },
					{ fragments: [3, 4, 5], description: 'Mika is my female nickname. Call me this if you wanna be my friend ;)' },
					{ fragments: [7], description: 'To add uniqueness, I gave my character a last name. Arome is the japanese for "Tentatek", the brand of sportswear in Splatoon I\'ve been known to like.' }
				],
				nameIndex: 0
			}
		},
		mounted() {
			// Start an interval which cycles through the names
			setInterval(() => {
				let nextIndex = this.nameIndex + 1;
				if (nextIndex >= this.nameOrigin.length) { nextIndex = 0; }
				this.nameIndex = nextIndex;
			}, 5000);
		}
	}
</script>

<style scoped>
	.title-row {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		height: 130px;
		user-select: none;
		text-align: center;
	}
	.title-pfp {
		width: 200px;
		height: 200px;
		border-radius: 100%;
		filter: grayscale(25%);
	}
	.title-tomika-ink {
		transform: translateY(-40%);
	}
	.title-tomika-ink img {
		width: 300px;
	}
	.caption {
		font-style: italic;
		color: hsl(0,0%,80%);
		font-size: 0.85em;
	}
	.name-origin {
		margin: 16px 0;
	}
	.name-origin h2 {
		margin: 0;
	}
	.name-origin h2 > span {
		opacity: 0.5;
	}
	.name-origin div {
		font-size: 16px;
	}
	.name-origin div:nth-of-type(2) {
		height: 40px;
	}
	.name-origin h2 > span.highlighted {
		opacity: 1;
	}
</style>