<fieldset class="login-form">
    <legend>Login:</legend>
    <form action="<?= @$data['base_path']; ?>/backend/login" method="post">
        <div class="login-form--field">
            <input placeholder="Username" type="text" id="username" name="_username" required>
        </div>
        <div class="login-form--field">
            <input placeholder="Password" type="password" id="password" name="_password" required>
        </div>
        <div class="login-form--field">
            <button type="submit" class="btn">Login</button>
        </div>
    </form>
</fieldset>