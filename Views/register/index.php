<fieldset class="register-form">
    <legend>Register:</legend>
    <form action="<?= @$data['base_path']; ?>/register" method="post">
        <div class="register-form--field">
            <input placeholder="Username" type="text" pattern="[a-z0-9_]{3,40}" id="username" name="_username" required>
        </div>
        <div class="register-form--field">
            <input placeholder="Password" type="password" id="password" name="_password" required>
        </div>
        <div class="register-form--field">
            <input placeholder="Confirm Password" type="password" id="password_confirm" name="_password_confirm" required>
        </div>
        <div class="register-form--field">
            <input placeholder="eMail" type="email" id="email" name="_email">
            <p>
                <strong>Note:</strong> You don't have to provide an e-mail address but you won't be able to
                recover your account if you forget your password. Unused accounts without signs of usage are also
                subject to be deleted at some time.
            </p>
        </div>
        <div class="register-form--field">
            <button type="submit">Register</button>
        </div>
    </form>
</fieldset>
