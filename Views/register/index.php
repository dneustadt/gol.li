<fieldset class="register-form">
    <legend>Register:</legend>
    <form action="<?= @$data['base_path']; ?>/register" method="post">
        <div class="register-form--field">
            <input placeholder="Username" type="text" pattern="[a-z0-9_]{3,40}" minlength="3" id="username" name="_username" required>
        </div>
        <?php if (@$data['error']['username_taken']): ?>
            <ul class="errors">
                <li>The username was already taken or the email address is already registered</li>
            </ul>
        <?php endif; ?>
        <?php if (@$data['error']['username']): ?>
            <ul class="errors">
                <li>The username must be all lowercase characters or numbers and may further contain only underscores</li>
                <li>Must contain at least 3 characters</li>
            </ul>
        <?php else: ?>
            <dl>
                <dt><strong>Note:</strong> The username must be at least 3 characters long, consist of all lowercase characters, numbers or
                    underscores. It will also determine the URL to your personal hub e.g. https://gol.li/demo</dt>
            </dl>
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
        <div class="register-form--field">
            <input placeholder="eMail" type="email" id="email" name="_email" required>
            <p>
                <strong>Note:</strong> You will have to confirm your email address to complete the registration.
            </p>
        </div>
        <?php if (@$data['error']['email']): ?>
            <ul class="errors">
                <li>Please provide a valid email address</li>
            </ul>
        <?php endif; ?>
        <?php if (@$data['error']['all']): ?>
            <ul class="errors">
                <li>Please provide all necessary information</li>
            </ul>
        <?php endif; ?>
        <div class="register-form--field">
            <button type="submit">Register</button>
        </div>
    </form>
</fieldset>
