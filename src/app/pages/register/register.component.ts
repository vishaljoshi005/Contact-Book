import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { RegisterService } from '@/core/services/register/register.service';
import { Router } from '@angular/router';
import { UserValidatorsService } from '@/core/services/validators/user-validators/user-validators.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;

  // Password Match Validator
  private passwordMatcher(control: FormControl): { [s: string]: boolean } {
    if (
      this.registerForm &&
      (control.value !== this.registerForm.controls.password.value)
    ) {
      return { passwordNotMatch: true };
    }
    return null;
  }

  constructor(private formBuilder: FormBuilder, private cd: ChangeDetectorRef,
              private snackBar: MatSnackBar, private registrationService: RegisterService,
              private router: Router, private validator: UserValidatorsService) { }

  createForm() {
    this.registerForm = this.formBuilder.group({
      profile: [null],
      email: ['', [Validators.required, Validators.email], [this.validator.userEmailValidator()] ],
      password: ['', [Validators.required]],
      confirmpassword: ['', [Validators.required, this.passwordMatcher.bind(this)]],
      name: [null, [Validators.required]],
      phone: [null, [Validators.required, Validators.pattern( '[0-9]{0,10}')]]
    });
    }
    get email() {return this.registerForm.get('email'); }

  resetForm(form: FormGroup) {
    form.reset();
    Object.keys(form.controls).forEach(key => {
      form.get(key).setErrors(null) ;
    });
  }

  openSnackBarSuccess() {
    this.snackBar.open('Registration successful', 'Close', {
      duration: 4000,
      panelClass: ['style-success'],
    });
  }
  openSnackBarFail() {
    this.snackBar.open('Registration failed', 'Close', {
      duration: 2000,
      panelClass: ['style-success'],
    });
  }
  ngOnInit() {
    this.createForm();
  }
  get confirmpassword() { return this.registerForm.get('confirmpassword'); }

  // onFileChange(event) {
  //   const reader = new FileReader();

  //   if (event.target.files && event.target.files.length) {
  //     const [file] = event.target.files;
  //     reader.readAsDataURL(file);

  //     reader.onload = () => {
  //       this.registerForm.patchValue({
  //         profileimage: reader.result
  //      });

  //       // need to run CD since file load runs outside of zone
  //       this.cd.markForCheck();
  //     };
  //   }
  // }

  onFileChange(event, field) {
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      // just checking if it is an image, ignore if you want
      if (!file.type.startsWith('profile')) {
        this.registerForm.get(field).setErrors({
          required: true
        });
        this.cd.markForCheck();
      } else {
        // unlike most tutorials, i am using the actual Blob/file object instead of the data-url
        this.registerForm.patchValue({
          [field]: file
        });
        // need to run CD since file load runs outside of zone
        this.cd.markForCheck();
      }
    }
  }
  onSubmit() {
    const formData = new FormData();
    Object.entries(this.registerForm.value).forEach(
        ([key, value]: any[]) => {
          formData.set(key, value);
        });

      // Add service call here
    // this.registrationService.register(this.registerForm)
    //   .subscribe((data) => {
    //     if (data.success) {
    //       this.openSnackBarSuccess();
    //     } else {
    //       this.openSnackBarFail();
    //       // this.resetForm(this.registerForm);
    //     }
    //   });
    if (this.registerForm.valid) {
      console.log('Called');

      // const formData = new FormData();
      // Object.entries(this.registerForm.value).forEach(
      //   ([key, value]: any[]) => {
      //     formData.set(key, value);
      //   });

      // // Add service call here
      // this.registrationService.register(formData)
      // .subscribe((data) => {
      //   if (data.success) {
      //     this.openSnackBarSuccess();
      //   } else {
      //     this.openSnackBarFail();
      //     this.resetForm(this.registerForm);
      //   }
      // });

      // Add service call here
      this.registrationService.register(this.registerForm.value)
    .subscribe((data) => {
      if (data.success) {
        this.openSnackBarSuccess();
        this.resetForm(this.registerForm);
      } else {
        this.openSnackBarFail();
        // this.resetForm(this.registerForm);
      }
    });
    }
  }
}
