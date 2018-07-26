<fieldset class="register-form">
    <legend>Register:</legend>
    <form action="<?= @$data['base_path']; ?>/register" method="post">
        <div class="register-form--field">
            <input placeholder="Username" type="text" id="username" name="_username" required>
        </div>
        <div class="register-form--field">
            <input placeholder="eMail" type="email" id="email" name="_email">
        </div>
        <div class="register-form--field">
            <input placeholder="Password" type="password" id="password" name="_password" required>
        </div>
        <div class="register-form--field">
            <input placeholder="Confirm Password" type="password" id="password_confirm" name="_password_confirm" required>
        </div>
        <div class="register-form--field">
            <button type="submit">Register</button>
        </div>
    </form>
</fieldset>
