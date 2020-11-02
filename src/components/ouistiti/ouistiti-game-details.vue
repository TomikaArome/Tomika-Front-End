<template>
	<div class="game-details" :class="{ joinable: clickable && game.joinable }">
		<div class="game-graphic">
			<font-awesome-icon :icon="['fa-tomika', 'spade']"></font-awesome-icon>
		</div>
		<div class="game-middle-details">
			<div>{{ game.hostNickname }}</div>
			<div>
				<font-awesome-icon v-if="game.passwordProtected" icon="lock" style="margin-right: 4px;"></font-awesome-icon>
				<template v-if="game.inProgress">In progress - round {{ game.round }}/{{ game.totalRoundCount }}</template>
				<template v-else>Joinable<template v-if="game.passwordProtected"> - Password protected</template></template>
			</div>
		</div>
		<div class="game-player-count">
			<span>{{ game.playersCount }}</span><font-awesome-icon icon="users"></font-awesome-icon>
		</div>
	</div>
</template>

<script>
	export default {
		name: "ouistiti-game-details",
		props: ['game', 'clickable']
	}
</script>

<style scoped>
.game-details {
	display: flex;
	flex-direction: row;
	align-items: center;
	transition: background-color 100ms;
	border-radius: 8px;
	margin-bottom: 8px;
}
.joinable {
	cursor: pointer;
}
.joinable:hover {
	background-color: hsla(0,0%,100%,0.05);
}
.game-graphic {
	background-color: hsl(240,50%,60%);
	border-radius: 8px;
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: hsla(0,0%,100%,0.5);
	font-size: 1.5em;
}
.game-middle-details {
	flex-grow: 1;
	padding: 0 12px;
}
.game-middle-details > div:nth-child(1) {
	font-weight: bold;
	font-size: 1.3em;
}
.game-middle-details > div:nth-child(2) {
	color: hsl(0,0%,60%);
}
.game-player-count {
	color: hsl(0,0%,80%);
	padding: 8px;
}
.game-player-count > span {
	font-weight: bold;
	margin: 0 4px;
}
</style>