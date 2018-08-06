<?php if (@$data['sent']): ?>
    <p>
        If the provided email address was in our database, we sent an email
        including a link to reset your password.
    </p>
<?php else: ?>
    <div class="row">
        <div class="column">
            <fieldset class="reset-form">
                <legend>Request password reset:</legend>
                <form action="<?= @$data['base_path']; ?>/login/reset" method="post">
                    <div class="reset-form--field">
                        <input placeholder="Email" type="email" id="email" name="_email" required>
                    </div>
                    <div class="reset-form--field">
                        <button type="submit">Request Password Reset</button>
                    </div>
                </form>
            </fieldset>
        </div>
        <div class="column"></div>
    </div>
<?php endif; ?>