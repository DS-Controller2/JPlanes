const assert = require('assert');
const gameLogic = require('../src/services/gameLogic');
const Player = require('../src/models/Player');
const Airplane = require('../src/models/Airplane');
const GameSession = require('../src/models/GameSession');

// Helper function to reset gameLogic state before each test if needed
function resetGameLogic() {
    gameLogic.gameSessions.clear();
}

console.log("Running gameLogic.test.js...");

// Test Suite for Game Logic
try {
    // Test 1: createGameSession
    resetGameLogic();
    const session1Id = 'testSession1';
    const session1 = gameLogic.createGameSession(session1Id);
    assert.ok(session1 instanceof GameSession, 'Test 1.1 Failed: Should create a GameSession object.');
    assert.strictEqual(session1.sessionId, session1Id, 'Test 1.2 Failed: Session ID should match.');
    assert.ok(gameLogic.gameSessions.has(session1Id), 'Test 1.3 Failed: Session should be added to gameSessions map.');
    console.log('Test 1 (createGameSession) passed.');

    // Test 2: getGameSession
    resetGameLogic();
    const session2Id = 'testSession2';
    gameLogic.createGameSession(session2Id);
    const retrievedSession = gameLogic.getGameSession(session2Id);
    assert.ok(retrievedSession instanceof GameSession, 'Test 2.1 Failed: Should retrieve a GameSession object.');
    assert.strictEqual(retrievedSession.sessionId, session2Id, 'Test 2.2 Failed: Retrieved session ID should match.');
    const nonExistentSession = gameLogic.getGameSession('nonExistentId');
    assert.strictEqual(nonExistentSession, undefined, 'Test 2.3 Failed: Should return undefined for non-existent session.');
    console.log('Test 2 (getGameSession) passed.');

    // Test 3: removeGameSession
    resetGameLogic();
    const session3Id = 'testSession3';
    gameLogic.createGameSession(session3Id);
    assert.ok(gameLogic.gameSessions.has(session3Id), 'Test 3.1 Failed: Session should exist before removal.');
    gameLogic.removeGameSession(session3Id);
    assert.strictEqual(gameLogic.gameSessions.has(session3Id), false, 'Test 3.2 Failed: Session should not exist after removal.');
    console.log('Test 3 (removeGameSession) passed.');

    // Test 4: Add player to session (via GameSession model method, indirectly testing gameLogic's use)
    resetGameLogic();
    const session4Id = 'testSession4';
    const session4 = gameLogic.createGameSession(session4Id);
    const player1 = new Player('p1', 'PlayerOne');
    session4.addPlayer(player1);
    assert.strictEqual(session4.players.size, 1, 'Test 4.1 Failed: Player count should be 1.');
    assert.deepStrictEqual(session4.getPlayer('p1'), player1, 'Test 4.2 Failed: Should retrieve the added player.');
    console.log('Test 4 (addPlayer to session) passed.');

    // Test 5: fireProjectile (basic check)
    resetGameLogic();
    const session5Id = 'testSession5';
    const session5 = gameLogic.createGameSession(session5Id);
    const player2 = new Player('p2', 'PlayerTwo');
    const airplane2 = new Airplane('fighter', 200, 100);
    airplane2.setPosition(100,100);
    player2.assignAirplane(airplane2);
    session5.addPlayer(player2);

    gameLogic.fireProjectile(session5, 'p2');
    assert.strictEqual(session5.projectiles.size, 1, 'Test 5.1 Failed: Projectile count should be 1 after firing.');
    const projectile = Array.from(session5.projectiles.values())[0];
    assert.strictEqual(projectile.ownerId, 'p2', 'Test 5.2 Failed: Projectile ownerId should be p2.');
    assert.strictEqual(projectile.position.x, 100, 'Test 5.3 Failed: Projectile initial X position incorrect.');
    console.log('Test 5 (fireProjectile) passed.');

    // Test 6: updateGameWorld - basic movement (airplane)
    resetGameLogic();
    const session6Id = 'testSession6';
    const session6 = gameLogic.createGameSession(session6Id);
    session6.updateGameState('active'); // Set game to active
    const player3 = new Player('p3', 'PlayerThree');
    const airplane3 = new Airplane('fighter', 200, 100); // Speed 200 units/sec
    airplane3.setPosition(0,0);
    airplane3.setVelocity(100, 0); // Moving right at 100 units/sec
    player3.assignAirplane(airplane3);
    session6.addPlayer(player3);

    // Simulate time passage for updateGameWorld
    session6.lastUpdateTime = Date.now() - 1000; // 1 second ago
    gameLogic.updateGameWorld(session6Id);
    assert.ok(airplane3.position.x > 90 && airplane3.position.x < 110, `Test 6.1 Failed: Airplane X position should be around 100 (was ${airplane3.position.x}).`);

    // Test boundary condition
    airplane3.setPosition(gameLogic.GAME_WORLD_WIDTH - 20, 0); // Near right edge
    airplane3.setVelocity(100,0);
    session6.lastUpdateTime = Date.now() - 1000;
    gameLogic.updateGameWorld(session6Id);
    const airplaneWidth = airplane3.width || 50; // Using placeholder from gameLogic
    assert.strictEqual(airplane3.position.x, gameLogic.GAME_WORLD_WIDTH - airplaneWidth, `Test 6.2 Failed: Airplane should be at right boundary (was ${airplane3.position.x}).`);
    console.log('Test 6 (updateGameWorld - airplane movement) passed.');

    // Test 7: Collision detection (simplified test)
    resetGameLogic();
    const session7Id = 'testSession7';
    const session7 = gameLogic.createGameSession(session7Id);
    session7.updateGameState('active');

    const attacker = new Player('attacker', 'Attacker');
    const attackerPlane = new Airplane('fighter', 100, 100);
    attackerPlane.setPosition(0,0);
    attacker.assignAirplane(attackerPlane);
    session7.addPlayer(attacker);

    const target = new Player('target', 'Target');
    const targetPlane = new Airplane('fighter',100,100);
    targetPlane.setPosition(20,0); // Close to projectile path
    target.assignAirplane(targetPlane);
    session7.addPlayer(target);

    // Fire a projectile from attacker towards target
    gameLogic.fireProjectile(session7, 'attacker'); // Fires upwards by default in current fireProjectile
    // Manually adjust projectile for a direct horizontal shot for this test
    const proj = Array.from(session7.projectiles.values())[0];
    proj.position = {x: 0, y: (targetPlane.height || 50) / 2 }; // Align with target center y
    proj.velocity = {x: 200, y: 0}; // Shoot right
    proj.damage = 10;

    const initialTargetHealth = targetPlane.health;
    session7.lastUpdateTime = Date.now() - 100; // 0.1 second ago, enough for projectile to travel
    gameLogic.updateGameWorld(session7Id);

    assert.strictEqual(targetPlane.health, initialTargetHealth - proj.damage, `Test 7.1 Failed: Target health should be reduced by projectile damage. Expected ${initialTargetHealth - proj.damage}, got ${targetPlane.health}`);
    assert.strictEqual(proj.isActive, false, 'Test 7.2 Failed: Projectile should be inactive after collision.');
    assert.strictEqual(attacker.score, 10, `Test 7.3 Failed: Attacker score should increase. Expected 10, got ${attacker.score}`);
    console.log('Test 7 (Collision Detection) passed.');


    console.log('\nAll gameLogic tests passed!');

} catch (error) {
    console.error('\nTest failed:');
    console.error(error);
}
