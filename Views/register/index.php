<fieldset class="register-form">
    <legend>Register:</legend>
    <form action="<?= @$data['base_path']; ?>/register" method="post">
        <div class="register-form--field">
            <input placeholder="Username" type="text" pattern="[a-z0-9_]{3,40}" minlength="3" id="username" name="_username" required>
        </div>
        <?php if (@$data['error']['username_taken']): ?>
            <ul class="errors">
                <li>The username was already taken</li>
            </ul>
        <?php endif; ?>
        <?php if (@$data['error']['username']): ?>
            <ul class="errors">
                <li>The username must be all lowercase characters or numbers and may further contain only underscores</li>
                <li>Must contain at least 3 characters</li>
            </ul>
        <?php endif; ?>
        <div class="register-form--field">
            <input placeholder="Password" type="password" minlength="6" id="password" name="_password" required>
        </div>
        <?php if (@$data['error']['password']): ?>
            <ul class="errors">
                <li>Must at least contain 6 characters</li>
            </ul>
        <?php endif; ?>
        <div class="register-form--field">
            <input placeholder="Confirm Password" type="password" minlength="6" id="password_confirm" name="_password_confirm" required>
        </div>
        <?php if (@$data['error']['password_confirm']): ?>
            <ul class="errors">
                <li>The provided passwords didn't match</li>
            </ul>
        <?php endif; ?>
        <?php if (@$data['error']['all']): ?>
            <ul class="errors">
                <li>Please provide all necessary information</li>
            </ul>
        <?php endif; ?>
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
